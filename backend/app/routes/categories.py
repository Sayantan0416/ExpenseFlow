from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryResponse

router = APIRouter(
    prefix="/api/categories",
    tags=["Categories"]
)


# ============================================================
# CREATE CATEGORY
# ============================================================

@router.post("/", response_model=CategoryResponse)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db)
):
    existing_category = (
        db.query(Category)
        .filter(
            Category.name == category.name,
            Category.type == category.type
        )
        .first()
    )

    if existing_category:
        raise HTTPException(
            status_code=400,
            detail="Category already exists"
        )

    new_category = Category(
        name=category.name.strip(),
        type=category.type
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


# ============================================================
# GET ALL CATEGORIES
# ============================================================

@router.get("/", response_model=list[CategoryResponse])
def get_categories(
    db: Session = Depends(get_db)
):
    return (
        db.query(Category)
        .order_by(Category.id.asc())
        .all()
    )


# ============================================================
# UPDATE CATEGORY
# ============================================================

@router.put("/{category_id}/", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category: CategoryCreate,
    db: Session = Depends(get_db)
):
    existing_category = (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )

    if not existing_category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    duplicate_category = (
        db.query(Category)
        .filter(
            Category.name == category.name,
            Category.type == category.type,
            Category.id != category_id
        )
        .first()
    )

    if duplicate_category:
        raise HTTPException(
            status_code=400,
            detail="Another category with this name already exists"
        )

    existing_category.name = category.name.strip()
    existing_category.type = category.type

    db.commit()
    db.refresh(existing_category)

    return existing_category


# ============================================================
# DELETE CATEGORY
# ============================================================

@router.delete("/{category_id}/")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    existing_category = (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )

    if not existing_category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    db.delete(existing_category)
    db.commit()

    return {
        "message": "Category deleted successfully"
    }