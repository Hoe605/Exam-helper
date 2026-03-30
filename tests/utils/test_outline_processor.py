import os
import sys
import json

# 加入根目录到 PYTHONPATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from src.core.utils.outline_processor import process_outline_json_file

def test_process_offline_json():
    # 1. 指向测试文件
    base_dir = os.getcwd()
    json_path = os.path.join(base_dir, "files", "1.json")
    
    if not os.path.exists(json_path):
        print(f"❌ 找不到资源文件: {json_path}")
        return

    print(f"\n--- [UTIL TEST] 正在处理嵌套 JSON: {json_path} ---")
    
    # 2. 执行转换
    flat_nodes = process_outline_json_file(json_path)
    
    # 3. 统计结果
    print(f"📊 提取总量: {len(flat_nodes)} 个节点")
    
    # 4. 抽样验证 (前 15 个，并特别关注 parent_name 的继承)
    print("\n🧐 拍扁后的抽样检查 (前 15 个):")
    for i, node in enumerate(flat_nodes[:15]):
        p_name = node.get('parent_name') or "--- (根节点)"
        desc_snippet = (node.get('description') or "")[:30] + "..." if node.get('description') else "无描述"
        print(f"  {i+1:2d}. [{node['name']:<15}] -> Parent: {p_name:<15} | Desc: {desc_snippet}")

    # 5. 断层验证 (检查是否有 parent_name 变化点)
    # 找到第一个 parent 不是 None 的节点进行打印
    nested_sampled = [n for n in flat_nodes if n.get('parent_name') is not None]
    if nested_sampled:
        print(f"\n✅ 确认为有效嵌套结构，第一个子节点关联到: {nested_sampled[0]['parent_name']}")
    else:
        print("\n⚠️ 警告: 未发现任何父子关联，请确认 JSON 是否为扁平结构。")

if __name__ == "__main__":
    test_process_offline_json()
