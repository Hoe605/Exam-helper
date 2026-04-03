import logging
from langgraph.graph import StateGraph, START, END
from typing import Dict, Any

from .state import ExtractState
from .node.slicing_node import slicing_node
from .node.extraction_node import extraction_node
from .node.saving_node import saving_node

logger = logging.getLogger(__name__)

def build_extract_agent():
    """构建【循环式】题库解析流水线"""
    workflow = StateGraph(ExtractState)
    
    workflow.add_node("slicer", slicing_node)
    workflow.add_node("extractor", extraction_node)
    workflow.add_node("saver", saving_node)
    
    workflow.add_edge(START, "slicer")
    workflow.add_edge("slicer", "extractor")
    workflow.add_edge("extractor", "saver")
    
    # 【核心重构】循环逻辑：只要还有待处理切片，就回到 extractor
    def should_continue(state: ExtractState):
        if state.get("pending_chunks") and len(state["pending_chunks"]) > 0:
            return "extractor"
        return END

    workflow.add_conditional_edges("saver", should_continue)
    
    return workflow.compile()

async def run_question_extraction_stream(content: str, outline_id: int):
    """
    【流式主入口】
    """
    initial_state = {
        "document_content": content,
        "outline_id": int(outline_id),
        "raw_chunks": [],
        "pending_chunks": [],
        "processed_count": 0,
        "total_count": 0,
        "current_batch_results": [],
        "extracted_questions": [],
        "db_stats": {"inserted": 0, "warnings": 0},
        "errors": []
    }
    
    app = build_extract_agent()
    
    async for event in app.astream(initial_state):
        # LangGraph event key 是节点名称
        node_name = list(event.keys())[0]
        state = event[node_name]
        
        if not state:
            continue
            
        # 产生增量更新
        yield {
            "step": node_name,
            "count": state.get("db_stats", {}).get("inserted", 0), # 显示当前已入库总量
            "total_chunks": state.get("total_count", 0),
            "processed_chunks": state.get("processed_count", 0),
            "db_response": f"Inserted/Warnings: {state.get('db_stats', {}).get('inserted')}/{state.get('db_stats', {}).get('warnings')}",
            "errors": state.get("errors", []),
        }
