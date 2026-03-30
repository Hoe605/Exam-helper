from typing import List, Optional, TypedDict
from pydantic import BaseModel, Field
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, START, END

from core.llm import get_llm
from core.util.prompt_loader import load_prompt_section
from core.tools.task_tool import edu_task_planner_tool, EduTaskPlan

# ==========================================
# 1. 定义数据结构 (Pydantic Models)
# ==========================================

class OutlineNode(BaseModel):
    """提取后的结构化知识点"""
    name: str = Field(description="大纲/知识点名称")
    level: int = Field(description="节点层级 (1-章, 2-节, 3-知识点)")
    parent_name: Optional[str] = Field(default=None, description="父节点名称")
    desc: Optional[str] = Field(default=None, description="掌握要求或详细描述")

class OutlineExtractionResult(BaseModel):
    """单次提取结果包裹"""
    nodes: List[OutlineNode]

# ==========================================
# 2. 定义 Graph 状态 (Graph State)
# ==========================================

class OutlineState(TypedDict):
    # 输入原文
    document_content: str
    
    # 规划产出 (Planner Node 填充)
    edu_objective: str                  # 教育目标
    knowledge_domain: str               # 学科域
    global_context_anchor: Optional[str] # 通用描述锚点
    task_list: List[dict]               # 待执行的物理切片计划列表
    
    # 执行进度
    current_task_index: int             # 当前处理到第几个任务
    
    # 最终业务产出
    all_extracted_nodes: List[OutlineNode] # 汇总的所有知识点
    errors: List[str]                   # 过程中出现的错误


# ==========================================
# 3. 定义 Nodes (节点逻辑)
# ==========================================

def planning_node(state: OutlineState):
    """
    负责初次审稿并制定教研解析计划
    """
    content = state["document_content"]
    llm = get_llm(streaming=False)
    
    # 绑定专门的教研规划工具
    llm_with_tools = llm.bind_tools([edu_task_planner_tool])
    
    # 加载提示词：Section 0 (规划段)
    planner_prompt = load_prompt_section("agent/outline_extraction", 0)
    
    messages = [
        SystemMessage(content=planner_prompt),
        HumanMessage(content=f"这是待处理的考纲全文：\n\n{content}\n\n请立即为这份考纲制定拆解计划。")
    ]
    
    print("\n--- [NODE: Planning] 正在制定任务编排计划 ---")
    response = llm_with_tools.invoke(messages)
    
    # 解析工具调用
    if not response.tool_calls:
        # 如果模型不听话，记录错误
        return {"errors": ["模型未能在 Planning 阶段调用 edu_task_planner_tool"]}
    
    # 我们假设模型只调用一次工具
    plan_args = response.tool_calls[0]["args"]
    
    return {
        "edu_objective": plan_args.get("educational_objective", ""),
        "knowledge_domain": plan_args.get("knowledge_domain", ""),
        "global_context_anchor": plan_args.get("global_context_anchor", ""),
        "task_list": plan_args.get("steps", []),
        "current_task_index": 0,
        "all_extracted_nodes": []
    }

# 后续将在此补充 execution_node 和 db_node ...


# ==========================================
# 4. 构建 Agent 图流 (Build LangGraph)
# ==========================================

def build_outline_agent():
    """构建【规划-执行-入库】三阶 Agent 工作流"""
    workflow = StateGraph(OutlineState)
    
    # 添加核心节点
    workflow.add_node("planning", planning_node)
    
    # 定义流程边
    workflow.add_edge(START, "planning")
    workflow.add_edge("planning", END)  # 当前先跑通 Planning，END 只作为临时终点
    
    return workflow.compile()
    