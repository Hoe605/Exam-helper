import logging
from langgraph.graph import StateGraph, START, END
from typing import Dict, Any

from .state import ExtractState
from .node.slicing_node import slicing_node
from .node.extraction_node import extraction_node
from .node.saving_node import saving_node

logger = logging.getLogger(__name__)

def build_extract_agent():
    """构建题库解析 Agent 流水线"""
    workflow = StateGraph(ExtractState)
    
    workflow.add_node("slicer", slicing_node)
    workflow.add_node("extractor", extraction_node)
    workflow.add_node("saver", saving_node)
    
    workflow.add_edge(START, "slicer")
    workflow.add_edge("slicer", "extractor")
    workflow.add_edge("extractor", "saver")
    workflow.add_edge("saver", END)
    
    return workflow.compile()

async def run_question_extraction_stream(content: str, outline_id: int):
    """
    【流式主入口】
    针对给定的文档内容，启动解析流水线，并产生实时的状态更新流。
    """
    initial_state = {
        "document_content": content,
        "outline_id": int(outline_id),
        "question_chunks": [],
        "current_batch_results": [],
        "db_response": "",
        "errors": []
    }
    
    app = build_extract_agent()
    
    async for event in app.astream(initial_state):
        # event 的 Key 是对应的 Node Name
        node_name = list(event.keys())[0]
        state_snapshot = event[node_name]
        
        if state_snapshot is None:
            continue
            
        yield {
            "step": node_name,
            "count": len(state_snapshot.get("current_batch_results", [])),
            "db_response": state_snapshot.get("db_response", ""),
            "errors": state_snapshot.get("errors", []),
            "snapshot": state_snapshot
        }
