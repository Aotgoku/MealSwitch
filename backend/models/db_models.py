# backend/models/db_models.py
"""
SQLAlchemy database models for MealSwitch:
- User: Core authentication and account identity.
- UserProfile: Calibrated physiological metrics, metabolic goals, and dietary parameters.
- MealPlan: Persisted AI meal plan outputs and nutritional metadata.
"""

import uuid
from sqlalchemy import Column, String, Boolean, Integer, Numeric, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.core.database import Base


# ============================================================
# TABLE 1: users
# ============================================================
class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    email = Column(
        String(255),
        unique=True,
        nullable=False
    )
    hashed_password = Column(
        String(255),
        nullable=False
    )
    full_name = Column(
        String(100),
        nullable=True
    )
    role = Column(
        String(50),
        default="user"
    )
    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now()
    )

    # Relationship: 1 User -> 1 UserProfile
    profile = relationship("UserProfile", back_populates="user", uselist=False)

    # Relationship: 1 User -> Multiple MealPlans
    meal_plans = relationship("MealPlan", back_populates="user")

    def __repr__(self):
        return f"<User id={self.id} email={self.email}>"


# ============================================================
# TABLE 2: user_profiles
# ============================================================
class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    age = Column(Integer, nullable=True)
    weight_kg = Column(Numeric(5, 2), nullable=True)
    height_cm = Column(Numeric(5, 2), nullable=True)
    gender = Column(String(10), nullable=True)
    activity_level = Column(String(20), nullable=True)
    dietary_preference = Column(String(50), nullable=True)
    primary_goal = Column(String(50), nullable=True)
    tdee = Column(Integer, nullable=True)
    bmi = Column(Numeric(4, 1), nullable=True)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="profile")

    def __repr__(self):
        return f"<UserProfile user_id={self.user_id} goal={self.primary_goal}>"


# ============================================================
# TABLE 3: meal_plans
# ============================================================
class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    title = Column(String(150), nullable=True)
    plan_data = Column(JSONB, nullable=False)
    target_calories = Column(Integer, nullable=True)
    actual_calories = Column(Integer, nullable=True)
    is_optimized = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="meal_plans")

    def __repr__(self):
        return f"<MealPlan id={self.id} title={self.title}>"
