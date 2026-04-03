import logging
from langgraph.graph import StateGraph, START, END

from .state import OutlineState
from src.core.agent.outline.node.planning_node import planning_node
from src.core.agent.outline.node.execution_node import exe_node
from src.core.agent.outline.node.human_review_node import human_review_node
from src.core.agent.outline.node.persistence_node import persistence_node
from .router import decide_after_review, should_continue

# 配置日志
logger = logging.getLogger(__name__)

def build_outline_agent():
    """构建【规划 -> 审核 -> 递归提取 -> 持久化】LangGraph 工作流"""
    workflow = StateGraph(OutlineState) # type: ignore
    workflow.add_node("planning", planning_node) # type: ignore
    workflow.add_node("human_review", human_review_node) # type: ignore
    workflow.add_node("execution", exe_node) # type: ignore
    workflow.add_node("persistence", persistence_node) # type: ignore
    
    workflow.add_edge(START, "planning")
    workflow.add_edge("planning", "human_review")
    
    # 核心闭环：审核节点决定是去执行还是重修
    workflow.add_conditional_edges(
        "human_review", 
        decide_after_review,
        {
            "execution": "execution",
            "planning": "planning"
        }
    )
    
    # execution 完成单步后，通过 conditional edge 判断是继续执行还是前往入库
    workflow.add_conditional_edges("execution", should_continue)
    
    # 最终入库节点直通结束
    workflow.add_edge("persistence", END)
    
    return workflow.compile()

async def run_outline_extraction_stream(content: str, outline_id: int = 1):
    """
    【流式主入口】
    针对给定的考纲全文内容，启动解析流水线，并产生实时的状态更新流。
    
    Yields:
        dict: 包含当前步骤、任务状态、已提取节点数、错误信息等的字典。
    """
    initial_state = {
        "document_content": content,
        "task_list": [],
        "task_status": {},
        "all_extracted_nodes": [],
        "errors": [],
        "outline_id": outline_id,
        "user_feedback": None,
        "is_plan_approved": False,
        "global_background_content": None
    }
    
    app = build_outline_agent()
    
    # 使用 astream 监听 LangGraph 的每一个 step 变化
    async for event in app.astream(initial_state): # type: ignore
        # event 的 Key 是对应的 Node Name (planning, execution, persistence)
        node_name = list(event.keys())[0]
        state_snapshot = event[node_name]
        
        # 补全容错：如果 Snapshot 为空，则拿全量状态（通常在某些边或 Final 节点发生）
        if state_snapshot is None:
            continue
            
        # 将任务索引映射为具体的任务描述，以便前端直接展示名称
        task_list = state_snapshot.get("task_list", [])
        task_status = state_snapshot.get("task_status", {})
        display_tasks = {}
        
        for idx_str, status in task_status.items():
            try:
                idx = int(idx_str)
                if idx < len(task_list):
                    desc = task_list[idx].get("task_description", f"Task {idx}")
                    display_tasks[desc] = status
                else:
                    display_tasks[str(idx)] = status
            except (ValueError, TypeError):
                display_tasks[str(idx_str)] = status
                
        # 封装一个对用户友好的状态包
        yield {
            "step": node_name,
            "tasks": display_tasks,
            "node_count": len(state_snapshot.get("all_extracted_nodes", [])),
            "errors": state_snapshot.get("errors", []),
            "snapshot": state_snapshot
        }