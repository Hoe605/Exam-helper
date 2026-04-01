from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.db.session import get_db
from . import crud, schemas
from typing import List, Dict

router = APIRouter(
    prefix="/staging",
    tags=["staging"]
)

@router.get("/", response_model=List[schemas.QuestionStaging])
def read_staging(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_staging_questions(db, skip=skip, limit=limit)

@router.get("/stats")
def read_stats(db: Session = Depends(get_db)):
    return crud.get_staging_stats(db)

@router.put("/{staging_id}", response_model=schemas.QuestionStaging)
def update_item(staging_id: int, update: schemas.QuestionStagingUpdate, db: Session = Depends(get_db)):
    db_item = crud.update_staging(db, staging_id=staging_id, update=update)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@router.delete("/{staging_id}")
def delete_item(staging_id: int, db: Session = Depends(get_db)):
    success = crud.delete_staging(db, staging_id=staging_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}
