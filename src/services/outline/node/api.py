from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.db.session import get_db
from . import crud, schemas
from typing import List

router = APIRouter(
    prefix="/nodes",
    tags=["node"]
)

@router.get("/outline/{outline_id}", response_model=List[schemas.Node])
def read_root_nodes(outline_id: int, db: Session = Depends(get_db)):
    """获取大纲下的根节点（支持递归获取子节点）"""
    return crud.get_root_nodes(db, outline_id=outline_id)

from src.core.utils.node import get_nodes_by_level

@router.get("/outline/{outline_id}/level/{level}", response_model=List[schemas.Node])
def read_nodes_at_level(outline_id: int, level: int, db: Session = Depends(get_db)):
    """按层级获取大纲下的所有知识点节点 (例如获取所有章节或所有考点)"""
    return get_nodes_by_level(outline_id=outline_id, node_level=level, db=db)

@router.get("/{node_id}", response_model=schemas.Node)
def read_node(node_id: int, db: Session = Depends(get_db)):
    db_node = crud.get_node(db, node_id=node_id)
    if not db_node:
        raise HTTPException(status_code=404, detail="Node not found")
    return db_node

@router.post("", response_model=schemas.Node)
def create_node(node: schemas.NodeCreate, db: Session = Depends(get_db)):
    return crud.create_node(db=db, node=node)

@router.put("/{node_id}", response_model=schemas.Node)
def update_node(node_id: int, node: schemas.NodeUpdate, db: Session = Depends(get_db)):
    db_node = crud.update_node(db=db, node_id=node_id, node=node)
    if not db_node:
        raise HTTPException(status_code=404, detail="Node not found")
    return db_node

@router.delete("/{node_id}")
def delete_node(node_id: int, db: Session = Depends(get_db)):
    success = crud.delete_node(db=db, node_id=node_id)
    if not success:
        raise HTTPException(status_code=404, detail="Node not found")
    return {"message": "Node deleted successfully"}
