from langgraph.graph import StateGraph, START, END
from .state import ClassifyState
from .nodes import (
    fetch_context_node,
    llm_classify_node,
    save_mapping_node
)

def build_classify_agent():
    """
    构建【获取题目上下文 -> LLM 分类 -> 持久化】工作流
    """
    workflow = StateGraph(ClassifyState)
    
    # 注册节点
    workflow.add_node("fetch_context", fetch_context_node)
    workflow.add_node("llm_classify", llm_classify_node)
    workflow.add_node("save_mapping", save_mapping_node)
    
    # 连边流程
    workflow.add_edge(START, "fetch_context")
    workflow.add_edge("fetch_context", "llm_classify")
    workflow.add_edge("llm_classify", "save_mapping")
    workflow.add_edge("save_mapping", END)
    
    return workflow.compile()
