from typing import List, Optional, TypedDict
from pydantic import BaseModel, Field
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.output_parsers import PydanticOutputParser
from langgraph.graph import StateGraph, START, END

from core.llm import get_llm
from core.util.prompt_loader import load_prompt_section
from core.util.text_util import slice_text_by_anchors
from core.tools.task_tool import edu_task_planner_tool

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
    edu_objective: str                  
    knowledge_domain: str               
    global_context_anchor: Optional[str] 
    task_list: List[dict]               
    
    # 执行进度
    current_task_index: int             
    
    # 最终业务产出
    all_extracted_nodes: List[OutlineNode] 
    errors: List[str]                   


# ==========================================
# 3. 定义 Nodes (节点逻辑)
# ==========================================

def planning_node(state: OutlineState):
    """
    负责初次审稿并制定教研解析计划 (Section 0)
    """
    content = state["document_content"]
    llm = get_llm(streaming=False)
    llm_with_tools = llm.bind_tools([edu_task_planner_tool])
    
    planner_prompt = load_prompt_section("agent/outline_extraction", 0)
    
    messages = [
        SystemMessage(content=planner_prompt),
        HumanMessage(content=f"这是待处理的考纲全文：\n\n{content}\n\n请立即为这份考纲制定拆解计划。")
    ]
    
    print("\n--- [NODE: Planning] 正在制定任务编排计划 ---")
    response = llm_with_tools.invoke(messages)
    
    if not response.tool_calls:
        return {"errors": ["模型未能在 Planning 阶段调用 edu_task_planner_tool"]}
    
    plan_args = response.tool_calls[0]["args"]
    
    return {
        "edu_objective": plan_args.get("educational_objective", ""),
        "knowledge_domain": plan_args.get("knowledge_domain", ""),
        "global_context_anchor": plan_args.get("global_context_anchor", ""),
        "task_list": plan_args.get("steps", []),
        "current_task_index": 0,
        "all_extracted_nodes": [],
        "errors": []
    }

def execution_node(state: OutlineState):
    """
    负责执行解析具体任务切片 (Section 1)
    """
    idx = state["current_task_index"]
    task_list = state["task_list"]
    full_text = state["document_content"]
    
    if idx >= len(task_list):
        return {}

    current_task = task_list[idx]
    
    # 1. 提取物理切片
    # 如果有全局上下文锚点，也要把全局锚点后的文字带上？
    # 这里我们采用更纯粹的做法：截取当前任务锚点范围，并附加 global_context
    global_anchor = state.get("global_context_anchor")
    global_txt = slice_text_by_anchors(full_text, global_anchor, "") if global_anchor else ""
    slice_txt = slice_text_by_anchors(full_text, current_task.get("start_anchor"), current_task.get("end_anchor"))
    
    # 将全局说明附在大章节前，防止信息缺失
    target_content = f"【全局参考信息】\n{global_txt}\n\n【本章节待解析内容】\n{slice_txt}"
    
    # 2. 调用业务解析 (Section 1)
    llm = get_llm(streaming=False)
    extraction_prompt_tpl = load_prompt_section("agent/outline_extraction", 1)
    parser = PydanticOutputParser(pydantic_object=OutlineExtractionResult)
    format_instructions = parser.get_format_instructions()
    
    messages = [
        SystemMessage(content=extraction_prompt_tpl.format(format_instructions=format_instructions)),
        HumanMessage(content=f"开始解析任务 [{current_task.get('description')}]:\n\n{target_content}")
    ]
    
    print(f"\n--- [NODE: Execution] 正在执行任务 {idx+1}/{len(task_list)}: {current_task.get('description')} ---")
    response = llm.invoke(messages)
    
    try:
        result = parser.parse(response.content)
        new_nodes = state["all_extracted_nodes"] + result.nodes
        return {
            "all_extracted_nodes": new_nodes,
            "current_task_index": idx + 1
        }
    except Exception as e:
        print(f"⚠️ 解析任务 {idx+1} 时出错: {e}")
        return {"current_task_index": idx + 1, "errors": state["errors"] + [f"Task {idx+1} failed"]}

def should_continue(state: OutlineState):
    """
    判断是否还有未完成的任务
    """
    if state.get("errors") and len(state["errors"]) > 3:
        return END
    
    if state["current_task_index"] < len(state["task_list"]):
        return "execution"
    return END

# ==========================================
# 4. 构建 Agent 图流 (Build LangGraph)
# ==========================================

def build_outline_agent():
    workflow = StateGraph(OutlineState)
    
    workflow.add_node("planning", planning_node)
    workflow.add_node("execution", execution_node)
    
    workflow.add_edge(START, "planning")
    workflow.add_edge("planning", "execution")
    
    # 使用循环控制
    workflow.add_conditional_edges(
        "execution",
        should_continue,
        {
            "execution": "execution",
            END: END
        }
    )
    
    return workflow.compile()