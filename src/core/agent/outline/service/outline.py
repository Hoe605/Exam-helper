from typing import List
from src.db.session import SessionLocal
from src.db.models import Outline, Node

def save_outline_to_db(nodes: List[any], name: str, description: str) -> str:
    """
    将考纲节点列表持久化到数据库，自动建立层级关系。
    """
    db = SessionLocal()
    try:
        with db.begin():
            # 1. 创建大纲主记录
            o = Outline(name=name, desc=description)
            db.add(o)
            db.flush()

            # 2. 批量创建节点并记录映射关系
            name_to_id = {}
            for n in nodes:
                db_node = Node(
                    outline_id=o.id,
                    name=n.name,
                    desc=n.description,
                    level=n.level,
                )
                db.add(db_node)
                db.flush()  # 获取自增 ID
                name_to_id[n.name] = db_node.id

            # 3. 建立父子平衡树关系 (基于 parent_name 寻找自增 ID)
            for n in nodes:
                if n.parent_name and n.parent_name in name_to_id:
                    child_id = name_to_id[n.name]
                    parent_id = name_to_id[n.parent_name]
                    db.query(Node).filter(Node.id == child_id).update({"f_node": parent_id})

        return f"✅ 成功持久化 {len(nodes)} 个考纲节点到数据库 (ID: {o.id})"
    except Exception as e:
        return f"❌ 大纲数据持久化失败: {str(e)}"
    finally:
        db.close()
