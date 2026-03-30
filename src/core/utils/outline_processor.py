import json
from typing import List, Dict, Any, Optional

def flatten_outline_tree(nodes: List[Dict[str, Any]], parent_name: Optional[str] = None, current_level: int = 1) -> List[Dict[str, Any]]:
    """
    递归处理考纲树形结构，将其转换为带有 parent_name 和 level 的平铺列表。
    """
    flat_results = []
    
    for node in nodes:
        # 1. 提取当前节点核心数据
        current_node = {
            "name": node.get("name"),
            "description": node.get("description") or node.get("desc"),
            "parent_name": parent_name,
            "level": current_level # 新增：记录深度 (1, 2, 3...)
        }
        flat_results.append(current_node)
        
        # 2. 递归处理子节点 (层级 +1)
        children = node.get("children", [])
        if children:
            child_flat = flatten_outline_tree(children, parent_name=node.get("name"), current_level=current_level + 1)
            flat_results.extend(child_flat)
            
    return flat_results

def process_outline_json_file(file_path: str) -> List[Dict[str, Any]]:
    """
    读取 JSON 文件并返回拍扁后的结果。
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    # 处理可能的包装格式 (比如 {"nodes": [...]})
    if isinstance(data, dict) and "nodes" in data:
        nodes = data["nodes"]
    elif isinstance(data, list):
        nodes = data
    else:
        nodes = [data]
        
    return flatten_outline_tree(nodes)
