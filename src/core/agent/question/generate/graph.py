from langgraph.graph import StateGraph, END
from .state import GenerateState
from .nodes import generate_node

def build_generate_agent():
    """
    构建练习题生成 Agent 流转图
    """
    workflow = StateGraph(GenerateState)
    
    # 添节点
    workflow.add_node("generate", generate_node)
    
    # 设定入口
    workflow.set_entry_point("generate")
    
    # 因为这个 Agent 目前比较简单（以后可能会有自我纠偏、知识点补充等节点）
    # 目前直接连 END
    workflow.add_edge("generate", END)
    
    return workflow.compile()
