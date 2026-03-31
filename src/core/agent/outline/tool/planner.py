from typing import List, Optional
from langchain_core.tools import tool
from src.core.agent.outline.schema.planning import EduTaskStep, EduTaskPlan

# ==========================================
# Tool 定义
# ==========================================

@tool("outline_planner", args_schema=EduTaskPlan)
def outline_planner_tool(
    educational_objective: str, 
    knowledge_domain: str, 
    steps: List[EduTaskStep], 
    global_background_content: Optional[str] = None
) -> str:
    """
    教育任务调度与规划工具。在执行解析、生成前，调用本工具制定详细的计划。
    """
    print(f"\n[EDU PLAN] 学科: {knowledge_domain} | 目标: {educational_objective}")
    print('-' *20 + f"\n [当前任务]" + '-' *20)
    return f"规划已接收：包含 {len(steps)} 个专门步骤。"
