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
    """并发调用 LLM 提取所有窗口中的题目。"""
    chunks = state["question_chunks"]
    outline_id = state.get("outline_id")
    llm = get_llm(streaming=False)
    llm_with_tools = llm.bind_tools([submit_question_tool])
    prompt_tpl = load_prompt_section("agent/question_slicing", 0)

    all_results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        futures = {
            pool.submit(_process_single_chunk, i, c, outline_id, prompt_tpl, llm_with_tools): i
            for i, c in enumerate(chunks)
        }
        for f in concurrent.futures.as_completed(futures):
            all_results.extend(f.result())

    logger.info("提取完成 | 原始题目数: %d", len(all_results))
    return {"current_batch_results": all_results}
