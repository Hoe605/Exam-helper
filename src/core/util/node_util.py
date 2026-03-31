from typing import List, Optional
from src.core.schema.outline import OutlineNode

def flatten_nodes(nodes: List[OutlineNode], parent_name: Optional[str] = None, current_level: int = 1) -> List[OutlineNode]:
    """
    将嵌套的 OutlineNode 树递归转换为平铺列表。
    自动为每个节点注入 parent_name 和 level 信息，并清空原始的 children 引用以实现解耦。
    
    Args:
        nodes: 待处理的起始节点列表（通常是树的根节点列表）
        parent_name: 父节点名称（内部递归使用）
        current_level: 当前节点的层级（内部递归使用）
        
    Returns:
        List[OutlineNode]: 拍扁后的节点列表
    """
    flat = []
    for node in nodes:
        # 1. 设置当前节点的父级与深度信息
        node.parent_name = parent_name
        node.level = current_level
        flat.append(node)
        
        # 2. 递归处理子孙
        if node.children and len(node.children) > 0:
            child_flat = flatten_nodes(node.children, parent_name=node.name, current_level=current_level + 1)
            flat.extend(child_flat)
            
        # 3. 拍扁后清空此引用，保持 Pydantic 对象干净（避免 DB 存储时的冗余嵌套）
        node.children = []
        
    return flat

def format_task_list_to_table(task_list: List[dict]) -> str:
    """
    将 Agent 的任务列表 (Steps) 格式化为易于阅读的文本表格。
    用于控制流展示或作为上下文提供给大模型参考。
    """
    if not task_list:
        return "[] (空任务列表)"
        
    header = f"{'ID':<4} | {'Action':<12} | {'Description':<40} | {'Anchors':<30}"
    separator = "-" * len(header)
    lines = [header, separator]
    
    for task in task_list:
        s_id = str(task.get("step_id", "?"))
        action = str(task.get("action_type", "N/A"))[:12]
        desc = str(task.get("description", "N/A"))[:40]
        anchors = f"{task.get('start_anchor', '')} -> {task.get('end_anchor', '')}"[:30]
        
        lines.append(f"{s_id:<4} | {action:<12} | {desc:<40} | {anchors:<30}")
        
    return "\n".join(lines)
