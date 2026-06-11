from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.db.session import get_db
from src.db.models import User
from src.core.auth.permissions import (
    assert_can_read_question,
    assert_can_read_staging,
    assert_can_write_staging,
    get_writable_outline_ids,
    require_teacher_or_admin,
)
from . import crud, schemas
from typing import List, Dict

router = APIRouter(
    tags=["staging"]
)

@router.get("", response_model=List[schemas.QuestionStaging])
def read_staging(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher_or_admin),
):
    outline_ids = get_writable_outline_ids(db, user)
    return crud.get_staging_questions(db, skip=skip, limit=limit, outline_ids=outline_ids)

@router.get("/stats")
def read_stats(
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher_or_admin),
):
    outline_ids = get_writable_outline_ids(db, user)
    return crud.get_staging_stats(db, outline_ids=outline_ids)

@router.get("/formal/{q_id}", response_model=schemas.QuestionStaging)
def read_formal_item(
    q_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher_or_admin),
):
    assert_can_read_question(db, user, q_id)
    db_item = crud.get_formal_item(db, q_id=q_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Formal item not found")
    # Wrap formal Question into QuestionStaging schema (compatible fields)
    from datetime import datetime
    return schemas.QuestionStaging(
        id=db_item.id,
        context=db_item.context,
        options=db_item.options,
        q_type=db_item.q_type,
        outline_id=db_item.outline_id,
        type=db_item.type,
        status="approved",
        created_at=datetime.utcnow()
    )

@router.get("/{staging_id}", response_model=schemas.QuestionStaging)
def read_staging_item(
    staging_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher_or_admin),
):
    assert_can_read_staging(db, user, staging_id)
    db_item = crud.get_staging_item(db, staging_id=staging_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@router.put("/{staging_id}", response_model=schemas.QuestionStaging)
def update_item(
    staging_id: int,
    update: schemas.QuestionStagingUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher_or_admin),
):
    assert_can_write_staging(db, user, staging_id)
    db_item = crud.update_staging(db, staging_id=staging_id, update=update)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@router.post("/resolve-duplicate")
def resolve_duplicate(
    payload: schemas.DuplicateResolve,
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher_or_admin),
):
    assert_can_write_staging(db, user, payload.keep_id)
    assert_can_write_staging(db, user, payload.discard_id)
    success = crud.resolve_duplicate(db, keep_id=payload.keep_id, discard_id=payload.discard_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to resolve duplicate conflict. One or both items might not exist.")
    return {"message": "Conflict resolved successfully"}

@router.delete("/{staging_id}")
def delete_item(
    staging_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher_or_admin),
):
    assert_can_write_staging(db, user, staging_id)
    success = crud.delete_staging(db, staging_id=staging_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}

@router.post("/approve-all")
def approve_all(
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher_or_admin),
):
    outline_ids = get_writable_outline_ids(db, user)
    count = crud.approve_all_pending(db, outline_ids=outline_ids)
    return {"message": f"Successfully approved {count} items", "count": count}

@router.post("/reject-all")
def reject_all(
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher_or_admin),
):
    outline_ids = get_writable_outline_ids(db, user)
    count = crud.reject_all_conflicts(db, outline_ids=outline_ids)
    return {"message": f"Successfully rejected {count} conflict items", "count": count}
