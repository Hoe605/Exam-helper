from typing import List, Optional
from src.db.session import SessionLocal
from src.db.models import Outline, Node

def save_outline_to_db(
    nodes: List[any],
    name: str,
    description: str,
    outline_id: Optional[int] = None,
) -> str:
    """
    将考纲节点列表持久化到数据库，自动建立层级关系。
    """
    db = SessionLocal()
    try:
        with db.begin():
            if outline_id is not None:
                o = db.query(Outline).filter(Outline.id == outline_id).first()
                if not o:
                    raise ValueError(f"Outline ID {outline_id} 不存在")

                o.name = name
                o.desc = description
                o.status = "Draft"
                existing_roots = db.query(Node).filter(
                    Node.outline_id == outline_id,
                    Node.f_node.is_(None),
                ).all()
                for node in existing_roots:
                    db.delete(node)
                db.flush()
            else:
                o = Outline(name=name, desc=description)
                db.add(o)
                db.flush()

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
