# backend/api/auth.py
"""
Authentication endpoints:
1. POST /auth/register -> Registers new user, stores bcrypt hash, initializes profile.
2. POST /auth/login    -> Validates credentials and returns JWT bearer token.
3. GET  /auth/me       -> Validates JWT and returns current authenticated user.
4. POST /auth/demo     -> One-click instant demo access with pre-seeded metabolic profile.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import logging

from backend.core.database import get_db
from backend.core.security import hash_password, verify_password, create_access_token, decode_access_token
from backend.models.db_models import User, UserProfile, MealPlan
from backend.models.schemas import UserRegister, UserLogin, UserOut, TokenResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)


# ────────────────────────────────────────────────────────────
# Current User Dependency (JWT Token Verification)
# ────────────────────────────────────────────────────────────
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Extracts bearer token from Authorization header and returns user entity."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing"
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user_id = payload["sub"]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


# ────────────────────────────────────────────────────────────
# 1. REGISTER ENDPOINT
# ────────────────────────────────────────────────────────────
@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Registers a new user:
    - Verifies email uniqueness
    - Hashes password with bcrypt
    - Persists user record and default metabolic profile
    - Returns signed JWT token for immediate session hydration
    """
    clean_email = user_data.email.strip().lower()

    # 1. Check duplicate email
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already registered. Please login instead."
        )

    # 2. Hash password
    hashed_pwd = hash_password(user_data.password)

    # 3. Create User in PostgreSQL
    new_user = User(
        email=clean_email,
        hashed_password=hashed_pwd,
        full_name=user_data.full_name.strip() if user_data.full_name else None
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 4. Create default empty profile for this user
    new_profile = UserProfile(user_id=new_user.id)
    db.add(new_profile)
    db.commit()

    logger.info(f"New user registered: {new_user.email} (ID: {new_user.id})")

    # 5. Generate JWT Token
    access_token = create_access_token({
        "sub": str(new_user.id),
        "email": new_user.email
    })

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserOut(
            id=str(new_user.id),
            email=new_user.email,
            full_name=new_user.full_name,
            role=new_user.role or "user"
        )
    )


# ────────────────────────────────────────────────────────────
# 2. LOGIN ENDPOINT
# ────────────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates existing user credentials and returns signed JWT access token.
    """
    clean_email = login_data.email.strip().lower()

    # 1. Find user by email
    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # 2. Verify password
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    logger.info(f"User logged in successfully: {user.email}")

    # 3. Generate JWT Token
    access_token = create_access_token({
        "sub": str(user.id),
        "email": user.email
    })

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserOut(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role or "user"
        )
    )


# ────────────────────────────────────────────────────────────
# 3. GET CURRENT USER PROFILE (/auth/me)
# ────────────────────────────────────────────────────────────
@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns profile identity data of currently authenticated user."""
    return UserOut(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role or "user"
    )


# ────────────────────────────────────────────────────────────
# 4. INSTANT RECRUITER / DEMO ACCESS (/auth/demo)
# ────────────────────────────────────────────────────────────
@router.post("/demo", response_model=TokenResponse)
def login_demo_user(db: Session = Depends(get_db)):
    """
    Recruiters, hiring managers, and portfolio visitors can test the authenticated
    database experience with 1-click. Automatically creates or returns 'demo@mealswitch.io'
    with pre-seeded metrics and sample PostgreSQL meal plans.
    """
    demo_email = "demo@mealswitch.io"
    user = db.query(User).filter(User.email == demo_email).first()

    if not user:
        # Create demo user
        hashed_pwd = hash_password("MealSwitchDemo2026!")
        user = User(
            email=demo_email,
            hashed_password=hashed_pwd,
            full_name="Alex Rivera (Demo Account)",
            role="demo"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Seed realistic profile
        profile = UserProfile(
            user_id=user.id,
            age=26,
            weight_kg=72.5,
            height_cm=178.0,
            gender="male",
            activity_level="moderate",
            dietary_preference="veg",
            primary_goal="muscle_gain",
            bmi=22.9,
            tdee=2480
        )
        db.add(profile)

        # Seed 2 realistic saved meal plans in PostgreSQL
        plan1 = MealPlan(
            user_id=user.id,
            title="High-Protein Muscle Hypertrophy Protocol",
            target_calories=2480,
            actual_calories=2450,
            is_optimized=True,
            plan_data={
                "totalCalories": 2450,
                "plan": {
                    "breakfast": {
                        "name": "Oatmeal with Almond Milk, Chia & Whey",
                        "calories": 580,
                        "description": "High complex carbohydrates with slow-burning fiber and 35g protein."
                    },
                    "lunch": {
                        "name": "Grilled Tofu Quinoa Bowl with Steamed Broccoli",
                        "calories": 780,
                        "description": "Rich in leucine, micronutrients, and clean plant-based fats."
                    },
                    "dinner": {
                        "name": "Paneer Tikka with Multi-Grain Roti & Dal",
                        "calories": 690,
                        "description": "Slow-digesting casein protein to fuel nocturnal muscle recovery."
                    }
                }
            }
        )
        plan2 = MealPlan(
            user_id=user.id,
            title="Metabolic Reset & Fat Loss Day",
            target_calories=1900,
            actual_calories=1880,
            is_optimized=False,
            plan_data={
                "totalCalories": 1880,
                "plan": {
                    "breakfast": {
                        "name": "Avocado & Poached Egg Toast",
                        "calories": 420,
                        "description": "Healthy monounsaturated fats with bioavailable protein."
                    },
                    "lunch": {
                        "name": "Mediterranean Chickpea Salad",
                        "calories": 540,
                        "description": "High fiber and polyphenol-rich olive oil dressing."
                    },
                    "dinner": {
                        "name": "Steamed Edamame & Grilled Veggie Platter",
                        "calories": 460,
                        "description": "Light evening meal with anti-inflammatory herbs."
                    }
                }
            }
        )
        db.add(plan1)
        db.add(plan2)
        db.commit()

    # Generate token
    access_token = create_access_token({
        "sub": str(user.id),
        "email": user.email
    })

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserOut(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role or "demo"
        )
    )
