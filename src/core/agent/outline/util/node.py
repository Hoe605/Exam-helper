from typing import List, Optional
from src.core.agent.outline.schema.outline import OutlineNode
import json

def flatten_nodes(nodes: List[OutlineNode], parent_name: Optional[str] = None, current_level: int = 1) -> List[OutlineNode]:
    """
    将嵌套的 OutlineNode 树递归转换为平铺列表。
    自动为每个节点注入 parent_name 和 level 信息，并清空原始的 children 引用以实现解耦。
    """
    flat = []
    # print('=' *30 + f"[DEBUG] : 原始嵌套json" + '=' * 30)
    # print(json.dumps([node.model_dump() for node in nodes], ensure_ascii=False, indent=2))
    # print('=' *30 + f"[DEBUG] : 原始嵌套json" + '=' * 30)

    for node in nodes:
        # 1. 设置当前节点的父级与深度信息
        node.parent_name = parent_name
        node.level = current_level
        flat.append(node)
        
        # 2. 递归处理子孙
        if node.children and len(node.children) > 0:
            child_flat = flatten_nodes(node.children, parent_name=node.name, current_level=current_level + 1)
            flat.extend(child_flat)
        node.children = []
    
    # print('=' *30 + f"[DEBUG] : 拍平后json" + '=' * 30)
    # print(json.dumps([node.model_dump() for node in flat], ensure_ascii=False, indent=2))
    # print('=' *30 + f"[DEBUG] : 拍平后json" + '=' * 30)
        
    return flat

def print_outline_structure(nodes: List[any]):
    """
    控制台打印考纲层级结构。
    """
    for node in nodes:
        d = node.dict() if hasattr(node, "dict") else node
        indent = "  " * (d.get("level", 1) - 1)
        print(f"{indent}└─ [{d.get('level')}] {d.get('name')}")

# ==========================================
# 历史/JSON 兼容处理 (针对 dict 格式)
# ==========================================
import json
from typing import Dict, Any

def flatten_outline_tree(nodes: List[Dict[str, Any]], parent_name: Optional[str] = None, current_level: int = 1) -> List[Dict[str, Any]]:
    """
    递归处理考纲树形结构（dict 格式），将其转换为带有 parent_name 和 level 的平铺列表。
    """
    flat_results = []
    
    for node in nodes:
        current_node = {
            "name": node.get("name"),
            "description": node.get("description") or node.get("desc"),
            "parent_name": parent_name,
            "level": current_level
        }
        flat_results.append(current_node)
        
        children = node.get("children", [])
        if children:
            child_flat = flatten_outline_tree(children, parent_name=node.get("name"), current_level=current_level + 1)
            flat_results.extend(child_flat)
            
    return flat_results

def process_outline_json_file(file_path: str) -> List[Dict[str, Any]]:
    """
    从 JSON 文件读取并返回拍扁后的 dict 列表。
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    if isinstance(data, dict) and "nodes" in data:
        nodes = data["nodes"]
    elif isinstance(data, list):
        nodes = data
    else:
        nodes = [data]
        
    return flatten_outline_tree(nodes)
