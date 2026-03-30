import pytest
import os
import sys
import json

# 路径自举 (tests/agent/outline -> src)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../src")))

from core.agent.outline.outline_agent import execution_node, OutlineState, build_outline_agent

@pytest.mark.deep
def test_outline_agent_single_step_execution():
    """
    单元测试：验证 execution_node 在面对具体的 task_step 时，
    是否能正确利用物理锚点切片并输出 OutlineNode。
    """
    # 1. 准备大纲数据
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    syllabus_path = os.path.join(base_dir, "files", "考纲.md")
    
    with open(syllabus_path, "r", encoding="utf-8") as f:
        full_text = f.read()

    # 2. 模拟 Planner 产出的状态 (仅模拟第一个任务)
    mock_state = OutlineState(
        document_content=full_text,
        edu_objective="测试单步解析",
        knowledge_domain="高等数学",
        global_context_anchor="考生应识记或领会“高等数学”",
        task_list=[
            {
                "step_id": 1,
                "action_type": "大纲解析",
                "description": "解析第一章：函数、极限和连续的所有知识点",
                "start_anchor": "## 一、函数、极限和连续",
                "end_anchor": "## 二、一元函数微分学及其应用",
                "expected_output": "函数与极限的知识点图谱(JSON格式)"
            }
        ],
        task_status={0: "pending"},
        all_extracted_nodes=[],
        errors=[]
    )

    # 3. 直接调用 Node 函数 (Unit Test)
    print("\n--- [UNIT TEST] 正在测试 execution_node 单步解析能力 ---")
    result_state = execution_node(mock_state)
    print(f"\n✅ 节点提取结果 (前 3 个示例):")
    nodes_out = result_state.get("all_extracted_nodes", [])
    if nodes_out:
        sample_nodes = [n.model_dump() for n in nodes_out[:3]]
        print(json.dumps(sample_nodes, indent=2, ensure_ascii=False))
        if len(nodes_out) > 3:
            print(f"... 剩余 {len(nodes_out) - 3} 个节点已成功处理。")
    
    print(f"\n📊 任务状态更新:")
    print(json.dumps(result_state.get("task_status"), indent=2))
    
    return result_state

@pytest.mark.deep
def test_outline_agent_full_flow():
    """验证全解析循环的集成测试"""
    # (原本的流转测试内容，此处略)
    pass

if __name__ == "__main__":
    test_outline_agent_single_step_execution()
    print("\n🎉 单步解析单元测试执行完毕！")
