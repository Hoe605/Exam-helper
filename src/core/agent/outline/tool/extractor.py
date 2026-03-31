from typing import List, Optional
from langchain_core.tools import tool
from src.core.agent.outline.schema.outline import OutlineNode
from src.core.agent.outline.schema.extraction import ExtractionNode
from src.core.agent.outline.service import save_outline_to_db

@tool('submit_chapter_extraction', args_schema=ExtractionNode)
def submit_chapter_extraction_tool(
    name: str ,
    description: Optional[str] = None,
    children: Optional[List[dict]] = None
) -> str:
    """
    提交当前章节解析出的嵌套知识树。这是提取任务的最终输出。
    """
    return "节点已接收"

@tool
def submit_outline_extraction_tool(
    nodes: List[OutlineNode],
    name: str = "默认大纲",
    description: str = "",
) -> str:
    """
    持久化完整考纲数据到数据库，建立层级关联。
    """
    # 直接调用底层的 DB 业务单元
    return save_outline_to_db(nodes, name, description)
