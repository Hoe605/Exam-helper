from sqlalchemy.orm import Session
from src.db.models import Node
from . import schemas
from typing import List, Optional

def get_node(db: Session, node_id: int):
    return db.query(Node).filter(Node.id == node_id).first()

def get_nodes(db: Session, outline_id: int):
    return db.query(Node).filter(Node.outline_id == outline_id).all()

def get_root_nodes(db: Session, outline_id: int):
    return db.query(Node).filter(Node.outline_id == outline_id, Node.f_node.is_(None)).all()

def create_node(db: Session, node: schemas.NodeCreate):
    db_node = Node(**node.model_dump())
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node

def update_node(db: Session, node_id: int, node: schemas.NodeUpdate):
    db_node = db.query(Node).filter(Node.id == node_id).first()
    if db_node:
        update_data = node.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_node, key, value)
        db.commit()
        db.refresh(db_node)
    return db_node

def delete_node(db: Session, node_id: int):
    db_node = db.query(Node).filter(Node.id == node_id).first()
    if db_node:
        db.delete(db_node)
        db.commit()
        return True
    return False
