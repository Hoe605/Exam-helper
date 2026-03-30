import os
import sys
import json
from typing import List

# 加入根目录
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from src.core.tools.db_tool import submit_outline_extraction_tool
from src.core.schema.outline import OutlineNode
from src.core.utils.outline_processor import flatten_outline_tree

def test_json_to_db_persistence():
    # 1. 加载 1.json
    json_path = os.path.join(os.getcwd(), "files", "1.json")
    if not os.path.exists(json_path):
        print(f"❌ 找不到文件: {json_path}")
        return
        
    with open(json_path, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)
        
    # 2. 手动剥开 tool_calls 结构 (因为 Utility 现在不负责这一层了)
    if isinstance(raw_data, list) and "args" in raw_data[0]:
        nodes_data = raw_data[0]["args"]["nodes"]
    else:
        nodes_data = raw_data
        
    print(f"--- [DB TEST] 正在尝试将 1.json 数据持久化到数据库 ---")
    
    # 3. 将嵌套数据拍扁
    flat_data = flatten_outline_tree(nodes_data)
    print(f"📊 转换后共有 {len(flat_data)} 个平铺节点。")
    
    # 4. 实例化为 OutlineNode Pydantic 对象
    # (注意: 这里要保证字段名一致，即 name, description, parent_name)
    nodes = []
    for item in flat_data:
        nodes.append(OutlineNode(
            name=item["name"],
            description=item.get("description"),
            parent_name=item.get("parent_name"),
            level=item.get("level", 1) # 补全 level 数据
        ))
        
    # 5. 调用工具正式入库
    result = submit_outline_extraction_tool.invoke({"nodes": nodes})
    
    print(f"\n📢 入库执行结果:\n{result}")

if __name__ == "__main__":
    test_json_to_db_persistence()
