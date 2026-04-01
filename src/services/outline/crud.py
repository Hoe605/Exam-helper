from sqlalchemy.orm import Session
from sqlalchemy import func
from src.db.models import Outline, Node
from src.services.outline.schemas import OutlineCreate, OutlineUpdate
from typing import List, Optional

def get_outline(db: Session, outline_id: int):
    # Query with node count for a single outline
    result = db.query(
        Outline,
        func.count(Node.id).label("node_count")
    ).outerjoin(Node).filter(Outline.id == outline_id).group_by(Outline.id).first()
    
    if result:
        outline, count = result
        outline.node_count = count
        return outline
    return None

def get_outlines(db: Session, skip: int = 0, limit: int = 100) -> List[Outline]:
    # Query with node count for multiple outlines
    results = db.query(
        Outline,
        func.count(Node.id).label("node_count")
    ).outerjoin(Node).group_by(Outline.id).offset(skip).limit(limit).all()
    
    outlines = []
    for outline, count in results:
        outline.node_count = count
        outlines.append(outline)
    return outlines

def create_outline(db: Session, outline: OutlineCreate):
    db_outline = Outline(
        name=outline.name,
        desc=outline.desc,
        metadata_=outline.metadata
    )
    db.add(db_outline)
    db.commit()
    db.refresh(db_outline)
    db_outline.node_count = 0
    return db_outline

def update_outline(db: Session, outline_id: int, outline: OutlineUpdate):
    db_outline = get_outline(db, outline_id)
    if db_outline:
        update_data = outline.model_dump(exclude_unset=True)
        if "metadata" in update_data:
            update_data["metadata_"] = update_data.pop("metadata")
            
        for key, value in update_data.items():
            setattr(db_outline, key, value)
        
        db.commit()
        db.refresh(db_outline)
        # Re-fetch or re-count if necessary, but node_count property should persist or be reloaded
        return get_outline(db, outline_id)
    return db_outline

def delete_outline(db: Session, outline_id: int):
    db_outline = db.query(Outline).filter(Outline.id == outline_id).first()
    if db_outline:
        db.delete(db_outline)
        db.commit()
        return True
    return False
