from typing import List
from src.db.session import SessionLocal
from src.db.models import Node

def get_nodes_by_level(outline_id: int, node_level: int) -> List[Node]:
    """
    接收一个 outline_id 和 node_level，从数据库中查找并返回对应的知识点节点列表。
    
    Args:
        outline_id (int): 关联的大纲 ID
        node_level (int): 节点所在的层级 (例如 1:学项目, 2:章节, 3:知识点)
        
    Returns:
        List[Node]: 符合查询条件的 Node 对象列表
    """
    with SessionLocal() as db:
        # 查找对应大纲和层级的节点
        nodes = db.query(Node).filter(
            Node.outline_id == outline_id,
            Node.level == node_level,
            Node.status == 1  # 默认只查找启用状态的节点
        ).all()
        
        return nodes
