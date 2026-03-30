import pytest
import os
import sys
import json

# 路径自举：确保能找到 src 目录 (向上跳 3 级: tests/agent/outline -> tests/agent -> tests -> root)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../src")))

from core.agent.outline.outline_agent import planning_node, OutlineState

@pytest.mark.deep
def test_outline_agent_planning_logic():
    """验证规划节点逻辑"""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    syllabus_path = os.path.join(base_dir, "files", "考纲.md")
    
    with open(syllabus_path, "r", encoding="utf-8") as f:
        full_text = f.read()

    # 2. 直接对 Node 进行单元测试 (不触发后续的 Execution 循环)
    # 初始化一个空状态
    initial_state = OutlineState(document_content=full_text, errors=[])
    
    # 显式执行单个 Node
    result = planning_node(initial_state)

    print(f"\n[PLANNING NODE TEST] 识别到学科: {result.get('knowledge_domain')}")
    print(f"[PLANNING NODE TEST] 物理切片任务总数: {len(result.get('task_list', []))}")
    print(f"[PLANNING NODE TEST] 任务列表:\n{json.dumps(result, indent=4, ensure_ascii=False)}")
    
    assert len(result.get("task_list", [])) >= 5
    return result

if __name__ == "__main__":
    # 支持直接作为脚本运行预览
    test_outline_agent_planning_logic()
    print("\n✅ 脚本执行成功！")
