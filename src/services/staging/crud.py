from sqlalchemy.orm import Session
from src.db.models import QuestionStaging
from . import schemas
from typing import List, Optional

def get_staging_questions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(QuestionStaging).order_by(QuestionStaging.created_at.desc()).offset(skip).limit(limit).all()

def get_staging_by_status(db: Session, status: str):
    return db.query(QuestionStaging).filter(QuestionStaging.status == status).all()

def update_staging(db: Session, staging_id: int, update: schemas.QuestionStagingUpdate):
    db_item = db.query(QuestionStaging).filter(QuestionStaging.id == staging_id).first()
    if db_item:
        update_data = update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_item, key, value)
        db.commit()
        db.refresh(db_item)
    return db_item

def delete_staging(db: Session, staging_id: int):
    db_item = db.query(QuestionStaging).filter(QuestionStaging.id == staging_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False

def get_staging_stats(db: Session):
    total = db.query(QuestionStaging).count()
    pending = db.query(QuestionStaging).filter(QuestionStaging.status == "pending").count()
    warning = db.query(QuestionStaging).filter(QuestionStaging.status == "warning").count()
    approved = db.query(QuestionStaging).filter(QuestionStaging.status == "approved").count()
    return {
        "total": total,
        "pending": pending,
        "warning": warning,
        "approved": approved
    }
