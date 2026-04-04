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

def format_node_tree_md(node: Node, level: int = 0) -> str:
    """
    递归格式化子节点树为 Markdown 列表
    """
    indent = "  " * level
    desc = node.desc.strip() if node.desc else "无描述"
    # 如果描述太长，截断一点或者保持原样？这里选择保持原样以支持完整上下文。
    md = f"{indent}- **{node.name}**: {desc}\n"
    for child in node.children:
        md += format_node_tree_md(child, level + 1)
    return md

def normalize_node_to_md(db: Session, node_id: int) -> str:
    """
    将知识点及其上下文（祖先和子孙）转化为 Markdown 文档（Agent 版）
    """
    node = db.query(Node).filter(Node.id == node_id).first()
    if not node:
        return ""
    
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
        md += f"### 核心说明\n{node.desc}\n\n"
    else:
        md += f"### 核心说明\n(该节点暂无详细描述)\n\n"

    # 新增：递归解析子知识点 (针对上层知识点)
    if node.children:
        md += f"## 下级子知识点清单\n"
        md += f"> 当您根据上层知识点出题时，请参考以下具体子领域的内容：\n\n"
        for child in node.children:
            md += format_node_tree_md(child)
        md += "\n"
        
    if ancestors:
        md += f"## 上层上下文说明\n"
        for a in ancestors:
            md += f"- **{a.name}**: {a.desc or '无描述'}\n"
            
    return md
