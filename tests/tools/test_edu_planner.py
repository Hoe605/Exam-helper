import pytest
from langchain_core.messages import SystemMessage, HumanMessage
from core.llm import get_llm
from core.tools.task_tool import edu_task_planner_tool
from core.util.prompt_loader import load_prompt

@pytest.mark.deep
def test_edu_task_planner_tool_invocation():
    """
    深度测试：验证 LLM 是否能根据 plan_task 提示词的指令，
    主动且正确地调用 edu_task_planner 工具，并符合教育场景的 Schema 设定。
    """
    # 1. 准备大模型实例，并绑定我们的教研规划工具
    # 注意：工具调用（Tool Calling）通常不需要 streaming
    llm = get_llm(streaming=False)
    llm_with_tools = llm.bind_tools([edu_task_planner_tool])
    
    # 2. 从本地加载教研专项的编排提示词
    system_prompt = load_prompt("common/plan_task")
    
    # 3. 构造一个复杂的连续性教研任务请求
    user_request = """
    我这里有一份高一物理的【牛顿运动定律】大纲。
    我需要你：
    1. 先把它解析为带层级的知识图谱；
    2. 基于第二定律给我生成3道带解析的拔高计算题；
    3. 最后给出一个根据这3道题答题情况来评估学生物理思维的学情诊断方案。
    """
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_request)
    ]
    
    print("\n--- 正在请求大模型生成教研执行计划 ---")
    response = llm_with_tools.invoke(messages)
    
    # ==========================
    # TDD 断言：严格验证返回结构
    # ==========================
    
    # 断言 1: 模型必须输出了 tool_calls
    assert getattr(response, "tool_calls", None) is not None, "模型未能探测到必须的工具调用"
    assert len(response.tool_calls) > 0, "模型的 tool_calls 列表为空"
    
    tool_call = response.tool_calls[0]
    
    # 断言 2: 调用的工具必须是我们指定的 edu_task_planner
    assert tool_call["name"] == "edu_task_planner", f"期望调用 edu_task_planner，实际调用了 {tool_call['name']}"
    
    args = tool_call["args"]
    
    # ===== 打印输出，供 -s 模式下人工检查质量 =====
    print("\n[AI 自动生存的教研调度计划]:")
    print(f"🎯 总体目标: {args.get('educational_objective')}")
    print(f"📚 学科领域: {args.get('knowledge_domain')}")
    print(f"⚠️ 难点预判: {args.get('risk_assessment')}")
    for step in args.get("steps", []):
        print(f"  [{step.get('step_id')}] <{step.get('action_type')}> {step.get('description')} (产出: {step.get('expected_output')})")
        
    # 断言 3: Pydantic Schema 必填字段校验
    assert "educational_objective" in args
    assert "knowledge_domain" in args
    assert "risk_assessment" in args
    assert "steps" in args
    
    # 断言 4: 逻辑校验，模型应能将任务拆解为至少 3 步（大纲解析、题目生成、学情诊断）
    assert len(args["steps"]) >= 3, "拆解的步骤不足，与预期不符"
