from sqlalchemy.orm import Session
from src.db.models import Node, Outline
from typing import List, Optional

def get_node_ancestors(db: Session, node: Node) -> List[Node]:
    """
    通过递归获取节点的祖先节点列表（从根到父）
    """
    ancestors = []
    current_node = node
    while current_node.f_node:
        parent = db.query(Node).filter(Node.id == current_node.f_node).first()
        if parent:
            ancestors.insert(0, parent)
            current_node = parent
        else:
            break
    return ancestors

def normalize_node_to_md(db: Session, node_id: int) -> str:
    """
    将知识点及其上下文转化为 Markdown 文档
    """
    node = db.query(Node).filter(Node.id == node_id).first()
    if not node:
        return "未找到该知识点。"
    
    outline = db.query(Outline).filter(Outline.id == node.outline_id).first()
    outline_name = outline.name if outline else "未知大纲"
    
    ancestors = get_node_ancestors(db, node)
    
    # 构建路径显示
    path = " > ".join([a.name for a in ancestors] + [node.name])
    
    md = f"# 知识点详细说明\n\n"
    md += f"**归属大纲**: {outline_name}\n"
    md += f"**知识层级**: {path}\n\n"
    
    md += f"## 当前知识点: {node.name}\n\n"
    if node.desc:
        md += f"### 知识点解析\n{node.desc}\n\n"
    else:
        md += f"### 知识点解析\n(暂无详细描述)\n\n"
        
    if ancestors:
        md += f"## 上下文说明\n"
        for a in ancestors:
            md += f"- **{a.name}**: {a.desc or '无描述'}\n"
            
    return md
