from langchain_core.messages import SystemMessage, HumanMessage
from src.core.llm import get_llm
from src.core.utils.agent.prompt_loader import load_prompt_section
from src.core.agent.outline.util.task import format_task_list_to_md
from src.core.agent.outline.tool import (
    outline_planner_tool
)
from src.core.agent.outline.state import OutlineState
from typing import List
from langchain_core.messages import BaseMessage


def planning_node(state: OutlineState) -> dict:
    """
    负责初次审稿并制定层级编排计划 (Section 0)
    """
    content = state["document_content"]
    llm = get_llm(streaming=False)
    llm_with_tools = llm.bind_tools([outline_planner_tool], tool_choice="outline_planner")
    planner_prompt = load_prompt_section("agent/outline_extraction", 0)

    # 用户反馈，只有在check的时候，用户发来反馈的时候才会在planning阶段有这些内容
    feedback = state.get("user_feedback")
    current_plan_str = format_task_list_to_md(state.get("task_list", []))

    # 此消息列表的生命周期仅在当前节点内有效，不会被持久化
    messages : List[BaseMessage] = [
        SystemMessage(content=planner_prompt),
    ]
    
    # 如果有用户反馈，将其作为最新的 HumanMessage 引导模型修正
    if feedback:
        # 为了保持上下文，此时模型需要看到刚才制定的“差劲的计划”才能做修正。
        messages.append(HumanMessage(content=f"这是待处理的考纲全文：\n\n{content}"))
        messages.append(HumanMessage(content=f"你之前的计划如下：\n{current_plan_str}\n\n用户提出了以下修改建议：\n{feedback}\n\n请根据以上建议，综合原文，使用outline_planner_tool工具修正你的全部分大纲任务（Steps）。"))
    else:
        messages.append(HumanMessage(content=f"这是待处理的考纲全文：\n\n{content}\n\n请制定层级解析计划。"))
    
    # 容错：最多重试 3 次强制工具调用
    max_retries = 3
    plan_args = None
    
    for _ in range(max_retries):
        response = llm_with_tools.invoke(messages)
        if response.tool_calls:
            plan_args = response.tool_calls[0]["args"]
            break
            
    if not plan_args:
        # [DEBUG] print("[NODE: Planning] 重试 3 次后模型依然拒绝调用工具，任务终止。")
        return {
            "errors": ["模型在规划阶段连续 3 次未按规范调用工具"],
            "task_list": [],
            "task_status": {}
        }
        
    # [DEBUG] print(f"✅ [NODE: Planning] 成功制定了 {len(plan_args.get('steps', []))} 个切片任务。")
    steps = plan_args.get("steps", [])
    objective = plan_args.get("educational_objective", "提取完整的考纲知识图谱")
    domain = plan_args.get("knowledge_domain", "学科知识")
    background = plan_args.get("global_background_content", "")
    
    initial_status = {i: "pending" for i in range(len(steps))}
    
    return {
        "edu_objective": objective,
        "knowledge_domain": domain,
        "global_background_content": background,
        "task_list": steps,
        "task_status": initial_status,
        "all_extracted_nodes": [],
        "errors": [],
        "user_feedback": None,
        "is_plan_approved": False
    }
