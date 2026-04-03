import logging
import concurrent.futures
from langchain_core.messages import SystemMessage, HumanMessage
from src.core.llm import get_llm
from src.core.utils.agent.prompt_loader import load_prompt_section
from ..tool import submit_question_tool
from ..state import ExtractState

logger = logging.getLogger(__name__)

def _process_single_chunk(idx, chunk_content, outline_id, prompt_tpl, llm_with_tools):
    """对单个文本块调用 LLM 提取结构化题目。"""
    messages = [
        SystemMessage(content=prompt_tpl),
        HumanMessage(content=f"提取如下题目：\n\n{chunk_content}")
    ]
    try:
        response = llm_with_tools.invoke(messages)
        if response.tool_calls:
            questions = response.tool_calls[0]["args"].get("questions", [])
            for q in questions:
                q["outline_id"] = int(outline_id) if outline_id else None
            return questions
        return []
    except Exception as e:
        logger.warning("Chunk %d 解析失败: %s", idx, e)
        return []

def extraction_node(state: ExtractState):
    """原子提取节点：每次仅从待处理队列中弹出一个块进行 AI 解析。"""
    pending = state.get("pending_chunks", [])
    if not pending:
        logger.info("队列已空，停止提取。")
        return {"current_batch_results": []}
        
    # 取出第一个块进行处理
    chunk_content = pending[0]
    outline_id = state.get("outline_id")
    
    llm = get_llm(streaming=False)
    llm_with_tools = llm.bind_tools([submit_question_tool])
    prompt_tpl = load_prompt_section("agent/question_slicing", 0)

    logger.info("启动原子提取 | 剩余队列: %d", len(pending))
    
    # 执行提取逻辑 (复用之前的私有处理函数逻辑)
    messages = [
        SystemMessage(content=prompt_tpl),
        HumanMessage(content=f"提取如下题目：\n\n{chunk_content}")
    ]
    
    batch_results = []
    try:
        response = llm_with_tools.invoke(messages)
        if response.tool_calls:
            batch_results = response.tool_calls[0]["args"].get("questions", [])
            for q in batch_results:
                q["outline_id"] = int(outline_id) if outline_id else None
    except Exception as e:
        logger.warning("当前块解析失败: %s", e)

    return {
        "current_batch_results": batch_results,
        "pending_chunks": pending[1:] # 移除已处理的块
    }
