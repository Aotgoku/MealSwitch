# backend/api/meal_plans.py
"""
Meal plan persistence endpoints:
1. POST   /meal-plans           -> Saves generated meal plan to PostgreSQL.
2. GET    /meal-plans           -> Lists all saved meal plan summaries for the authenticated user.
3. GET    /meal-plans/{plan_id} -> Retrieves full JSON payload of a single meal plan.
4. DELETE /meal-plans/{plan_id} -> Removes a meal plan owned by the authenticated user.
"""

import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from backend.core.database import get_db
from backend.api.auth import get_current_user
from backend.models.db_models import User, MealPlan
from backend.models.schemas import MealPlanSaveRequest, MealPlanOut, MealPlanSummaryOut

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/meal-plans", tags=["Meal Plans Database"])


@router.post("", response_model=MealPlanOut, status_code=status.HTTP_201_CREATED)
def save_meal_plan(
    data: MealPlanSaveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Persists a meal plan JSON object to the PostgreSQL meal_plans table."""
    new_plan = MealPlan(
        user_id=current_user.id,
        title=data.title.strip() if data.title else "My Meal Plan",
        plan_data=data.plan_data,
        target_calories=data.target_calories,
        actual_calories=data.actual_calories,
        is_optimized=data.is_optimized or False
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)

    logger.info(f"Meal plan '{new_plan.title}' saved for user {current_user.email} (ID: {new_plan.id})")

    return MealPlanOut(
        id=str(new_plan.id),
        user_id=str(new_plan.user_id),
        title=new_plan.title,
        plan_data=new_plan.plan_data,
        target_calories=new_plan.target_calories,
        actual_calories=new_plan.actual_calories,
        is_optimized=new_plan.is_optimized,
        created_at=new_plan.created_at
    )


@router.get("", response_model=List[MealPlanSummaryOut])
def get_user_meal_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all saved meal plan summaries for the authenticated user (chronological descending)."""
    plans = (
        db.query(MealPlan)
        .filter(MealPlan.user_id == current_user.id)
        .order_by(MealPlan.created_at.desc())
        .all()
    )

    return [
        MealPlanSummaryOut(
            id=str(p.id),
            title=p.title,
            target_calories=p.target_calories,
            actual_calories=p.actual_calories,
            is_optimized=p.is_optimized,
            created_at=p.created_at
        )
        for p in plans
    ]


@router.get("/{plan_id}", response_model=MealPlanOut)
def get_single_meal_plan(
    plan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves complete structured JSON data for a specific saved meal plan."""
    try:
        plan_uuid = uuid.UUID(plan_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid plan ID format")

    plan = (
        db.query(MealPlan)
        .filter(MealPlan.id == plan_uuid, MealPlan.user_id == current_user.id)
        .first()
    )
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found or does not belong to you"
        )

    return MealPlanOut(
        id=str(plan.id),
        user_id=str(plan.user_id),
        title=plan.title,
        plan_data=plan.plan_data,
        target_calories=plan.target_calories,
        actual_calories=plan.actual_calories,
        is_optimized=plan.is_optimized,
        created_at=plan.created_at
    )


@router.delete("/{plan_id}")
def delete_meal_plan(
    plan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Permanently deletes a saved meal plan belonging to the authenticated user."""
    try:
        plan_uuid = uuid.UUID(plan_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid plan ID format")

    plan = (
        db.query(MealPlan)
        .filter(MealPlan.id == plan_uuid, MealPlan.user_id == current_user.id)
        .first()
    )
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found or does not belong to you"
        )

    db.delete(plan)
    db.commit()
    logger.info(f"Meal plan {plan_id} deleted by user {current_user.email}")
    return {"status": "success", "message": "Meal plan deleted successfully"}
