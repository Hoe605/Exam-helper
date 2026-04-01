from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.db.session import get_db
from . import crud, schemas
from typing import List

router = APIRouter(
    prefix="/outlines",
    tags=["outline"]
)

@router.get("/", response_model=List[schemas.Outline])
def read_outlines(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_outlines(db, skip=skip, limit=limit)

@router.get("/{outline_id}", response_model=schemas.Outline)
def read_outline(outline_id: int, db: Session = Depends(get_db)):
    db_outline = crud.get_outline(db, outline_id=outline_id)
    if not db_outline:
        raise HTTPException(status_code=404, detail="Outline not found")
    return db_outline

@router.post("/", response_model=schemas.Outline)
def create_outline(outline: schemas.OutlineCreate, db: Session = Depends(get_db)):
    return crud.create_outline(db=db, outline=outline)

@router.put("/{outline_id}", response_model=schemas.Outline)
def update_outline(outline_id: int, outline: schemas.OutlineUpdate, db: Session = Depends(get_db)):
    db_outline = crud.update_outline(db=db, outline_id=outline_id, outline=outline)
    if not db_outline:
        raise HTTPException(status_code=404, detail="Outline not found")
    return db_outline

@router.delete("/{outline_id}")
def delete_outline(outline_id: int, db: Session = Depends(get_db)):
    success = crud.delete_outline(db=db, outline_id=outline_id)
    if not success:
        raise HTTPException(status_code=404, detail="Outline not found")
    return {"message": "Outline deleted successfully"}
