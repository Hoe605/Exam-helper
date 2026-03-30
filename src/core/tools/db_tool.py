from typing import List, Optional
from langchain_core.tools import tool
from src.db.session import SessionLocal
from src.db.models import Outline, Node
from src.core.schema.outline import OutlineNode

@tool
def preview_outline_tool(nodes: List[OutlineNode]) -> str:
    """
    【预览大纲】在控制台打印提取出的考纲结构，不写入数据库。
    """
    print("\n" + "🚀" * 5 + " [大纲解析预览] " + "🚀" * 5)
    for node in nodes:
        node_dict = node.dict() if hasattr(node, 'dict') else node
        level = node_dict.get('level', 1)
        indent = "  " * (level - 1)
        name = node_dict.get('name', 'Unknown')
        parent = node_dict.get('parent_name', 'None')
        print(f"{indent}└─ [{level}] {name} (P: {parent})")
    print("🚀" * 15 + "\n")
    return f"预览完成：共 {len(nodes)} 个节点。"

@tool
def submit_outline_extraction_tool(nodes: List[OutlineNode], name: str = "默认大纲", description: str = "") -> str:
    """
    【真实入库】将提取出的平铺考纲知识点列表持久化到数据库。
    全过程在一个事务中完成。
    """
    return persist_outline_to_db(nodes, name, description)

def persist_outline_to_db(nodes: List[OutlineNode], name: str = "新提取大纲", description: str = "") -> str:
    """
    【原子持久化】核心逻辑。先建大纲记录，再插入所有考点，最后建立父子关联。
    """
    if not nodes:
        return "提取列表为空，无需入库。"
    
    db = SessionLocal()
    try:
        # 使用 begin() 开启一个自动 commit/rollback 的事务上下文
        with db.begin():
            # 1. 插入大纲主体
            new_outline = Outline(name=name, desc=description)
            db.add(new_outline)
            db.flush()
            
            outline_id = new_outline.id
            
            # 2. 插入所有节点并映射名称到物理 ID
            name_to_id = {}
            for o_node in nodes:
                db_node = Node(
                    outline_id=outline_id,
                    name=o_node.name, 
                    desc=o_node.description, 
                    level=o_node.level
                )
                db.add(db_node)
                db.flush()
                name_to_id[o_node.name] = db_node.id
            
            # 3. 建立父子外键关联
            for o_node in nodes:
                if o_node.parent_name and o_node.parent_name in name_to_id:
                    child_id = name_to_id[o_node.name]
                    parent_id = name_to_id[o_node.parent_name]
                    db.query(Node).filter(Node.id == child_id).update({"f_node": parent_id})

        return f"✅ 成功持久化 {len(nodes)} 个考纲节点到数据库 (新分配 Outline ID: {outline_id})。"
        
    except Exception as e:
        return f"❌ 数据库写入失败（事务已回滚）: {str(e)}"
    finally:
        db.close()
