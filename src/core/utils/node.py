from typing import List, Optional
from sqlalchemy.orm import Session
from src.db.session import SessionLocal
from src.db.models import Node

def get_nodes_by_level(outline_id: int, node_level: int, db: Optional[Session] = None) -> List[Node]:
    """
    接收一个 outline_id 和 node_level，从数据库中查找并返回对应的知识点节点列表。
    可以传入外部 db session，否则默认创建新会话。
    
    Args:
        outline_id (int): 关联的大纲 ID
        node_level (int): 节点所在的层级 (例如 1:学项目, 2:章节, 3:知识点)
        db (Session, optional): SQLAlchemy 数据库会话
        
    Returns:
        List[Node]: 符合查询条件的 Node 对象列表
    """
    if db is None:
        with SessionLocal() as db_session:
            return _execute_node_query(db_session, outline_id, node_level)
    return _execute_node_query(db, outline_id, node_level)

def _execute_node_query(db: Session, outline_id: int, node_level: int) -> List[Node]:
    """具体的数据库查询执行逻辑"""
    return db.query(Node).filter(
        Node.outline_id == outline_id,
        Node.level == node_level,
        Node.status == 1  # 默认只查找启用状态的节点
    ).all()
