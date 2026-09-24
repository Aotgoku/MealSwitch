# backend/api/user.py
"""
User profile management endpoints:
1. GET /user/profile -> Fetches authenticated user's metabolic profile.
2. PUT /user/profile -> Updates biometric metrics and recalculates BMI & TDEE.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from decimal import Decimal
import logging

from backend.core.database import get_db
from backend.api.auth import get_current_user
from backend.models.db_models import User, UserProfile
from backend.models.schemas import UserProfileUpdate, UserProfileOut
from backend.services.nutrition_service import calculate_bmi, calculate_tdee

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/user", tags=["User Profile"])


@router.get("/profile", response_model=UserProfileOut)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves the metabolic profile for the currently authenticated user."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return UserProfileOut(
        id=str(profile.id),
        user_id=str(profile.user_id),
        age=profile.age,
        weight_kg=float(profile.weight_kg) if profile.weight_kg is not None else None,
        height_cm=float(profile.height_cm) if profile.height_cm is not None else None,
        gender=profile.gender,
        activity_level=profile.activity_level,
        dietary_preference=profile.dietary_preference,
        primary_goal=profile.primary_goal,
        tdee=profile.tdee,
        bmi=float(profile.bmi) if profile.bmi is not None else None,
        updated_at=profile.updated_at
    )


@router.put("/profile", response_model=UserProfileOut)
def update_user_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates profile biometric parameters and recalculates BMI and TDEE
    using the clinically validated Mifflin-St Jeor equation.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    if data.age is not None:
        profile.age = data.age
    if data.weight_kg is not None:
        profile.weight_kg = Decimal(str(data.weight_kg))
    if data.height_cm is not None:
        profile.height_cm = Decimal(str(data.height_cm))
    if data.gender is not None:
        profile.gender = data.gender
    if data.activity_level is not None:
        profile.activity_level = data.activity_level
    if data.dietary_preference is not None:
        profile.dietary_preference = data.dietary_preference
    if data.primary_goal is not None:
        profile.primary_goal = data.primary_goal

    # Calculate BMI & TDEE using single source of truth in nutrition_service
    w = float(profile.weight_kg) if profile.weight_kg else None
    h = float(profile.height_cm) if profile.height_cm else None

    if w and h and h > 0 and w > 0:
        bmi_val, _ = calculate_bmi(weight_kg=w, height_cm=h)
        if bmi_val > 0:
            profile.bmi = Decimal(str(bmi_val))

    if w and h and profile.age and profile.gender and profile.activity_level:
        try:
            profile.tdee = calculate_tdee(
                age=profile.age,
                weight_kg=w,
                height_cm=h,
                gender=profile.gender,
                activity_level=profile.activity_level
            )
        except Exception as e:
            logger.warning(f"Could not compute TDEE: {e}")

    db.commit()
    db.refresh(profile)

    logger.info(f"Profile updated for user {current_user.email} (BMI: {profile.bmi}, TDEE: {profile.tdee})")

    return UserProfileOut(
        id=str(profile.id),
        user_id=str(profile.user_id),
        age=profile.age,
        weight_kg=float(profile.weight_kg) if profile.weight_kg is not None else None,
        height_cm=float(profile.height_cm) if profile.height_cm is not None else None,
        gender=profile.gender,
        activity_level=profile.activity_level,
        dietary_preference=profile.dietary_preference,
        primary_goal=profile.primary_goal,
        tdee=profile.tdee,
        bmi=float(profile.bmi) if profile.bmi is not None else None,
        updated_at=profile.updated_at
    )
