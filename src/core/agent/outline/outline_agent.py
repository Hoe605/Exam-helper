from typing import List, Optional, TypedDict
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langgraph.graph import StateGraph, START, END

from core.llm import get_llm

# ==========================================
# 1. 定义数据结构 (Pydantic Models 约束输出)
# ==========================================
# 根据设计文档中的表结构，大纲转换为 `node` 树结构
class OutlineNode(BaseModel):
    name: str = Field(description="大纲/知识点名称，例如：'高等数学'、'微积分'、'极限运算'")
    level: int = Field(description="节点层级。例如：1代表学科/大模块，2代表章节，3代表具体考点")
    parent_name: Optional[str] = Field(default=None, description="父节点名称。如果是顶级节点则为空。用于后续构建树状结构")
    desc: Optional[str] = Field(default=None, description="该节点的详细描述或要求（如果有的话）")

class OutlineExtractionResult(BaseModel):
    """LLM 结构化输出的全局包裹"""
    nodes: List[OutlineNode] = Field(description="从文本中提取出的大纲节点列表")


# ==========================================
# 2. 定义 Graph 状态 (Graph State)
# ==========================================
class OutlineState(TypedDict):
    document_content: str               # 用户的原始文档输入
    extracted_nodes: List[OutlineNode]  # 提取后的节点存储列表
    # 后续可以加入 errors: List[str] 等状态


# ==========================================
# 3. 定义 Graph 节点函数 (Node Functions)
# ==========================================
def extract_nodes_node(state: OutlineState):
    """
    负责将纯文本按层级拆解为结构化节点
    """
    document_content = state["document_content"]
    
    # 获取 LLM 实例 (这里可以开启或关闭 streaming)
    llm = get_llm(streaming=False)
    
    # 采用 PydanticOutputParser 可以更好地兼容国内大模型（例如 GLM-4）有时返回带 markdown json 的情况
    parser = PydanticOutputParser(pydantic_object=OutlineExtractionResult)
    format_instructions = parser.get_format_instructions()
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "你是一个教育领域的知识图谱构建专家。\n"
                   "你的任务是从用户提供的大纲文本中，提取出所有层级结构（包括学科、章节、具体的考点），并识别它们的父子关系。\n"
                   "要求尽可能的细化，明确 parent_name 以便我们在数据库重构为树形结构。\n"
                   "请严格按照以下 JSON 格式输出，不要包含任何多余的解释文字或 MarkDown 块修饰：\n"
                   "{format_instructions}"),
        ("user", "以下是待解析的大纲片段：\n\n{document_content}")
    ])
    
    chain = prompt | llm | parser
    
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info("--- 正在调用 LLM 进行大纲深度提取 ---")
    result: OutlineExtractionResult = chain.invoke({
        "document_content": document_content,
        "format_instructions": format_instructions
    })
    logger.info(f"--- 提取完成，共获得 {len(result.nodes)} 个知识节点 ---")
    
    # 将提取结果写回 State
    return {"extracted_nodes": result.nodes}


# ==========================================
# 4. 构建图图流 (Build LangGraph)
# ==========================================
def build_outline_agent():
    """构建大纲解析 Agent 的工作流"""
    workflow = StateGraph(OutlineState)
    
    # 添加节点
    workflow.add_node("extract_nodes", extract_nodes_node)
    
    # 定义流程
    workflow.add_edge(START, "extract_nodes")
    workflow.add_edge("extract_nodes", END)
    
    # 后续可以添加 "write_to_db" 节点
    # workflow.add_node("write_to_db", write_to_db_node)
    # workflow.add_edge("extract_nodes", "write_to_db")
    # workflow.add_edge("write_to_db", END)
    
    return workflow.compile()
