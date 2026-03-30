import logging
import concurrent.futures
from typing import List, TypedDict, Dict, Any
from langgraph.graph import StateGraph, START, END
from langchain_core.messages import SystemMessage, HumanMessage

from src.core.llm import get_llm
from src.core.util.prompt_loader import load_prompt_section
from src.core.tools.db_tool import submit_question_to_staging_tool, QuestionSchema

logger = logging.getLogger(__name__)

# ==========================================
# 1. 状态定义
# ==========================================

class QuestionState(TypedDict):
    document_content: str
    outline_id: int
    question_chunks: List[str]
    current_batch_results: List[dict]
    db_response: str
    errors: List[str]

# ==========================================
# 2. 节点逻辑
# ==========================================

WINDOW_SIZE = 2500
OVERLAP = 300


def sliding_window_slicer_node(state: QuestionState):
    """滑动窗口切分：固定窗口 + 重叠区，防止题目被截断。"""
    content = state["document_content"]
    chunks = []
    start = 0
    while start < len(content):
        chunks.append(content[start:start + WINDOW_SIZE])
        start += WINDOW_SIZE - OVERLAP
        if start >= len(content):
            break
    logger.info("切分完成 | 窗口: %d 字符 | 重叠: %d | 块数: %d", WINDOW_SIZE, OVERLAP, len(chunks))
    return {"question_chunks": chunks}


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


def extractor_node(state: QuestionState):
    """并发调用 LLM 提取所有窗口中的题目。"""
    chunks = state["question_chunks"]
    outline_id = state.get("outline_id")
    llm = get_llm(streaming=False)
    llm_with_tools = llm.bind_tools([submit_question_to_staging_tool])
    prompt_tpl = load_prompt_section("agent/question_slicing", 1)

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


def saver_node(state: QuestionState):
    """将提取结果批量写入 Staging 缓冲区。"""
    raw = state.get("current_batch_results", [])
    if not raw:
        return {"db_response": "未提取到题目"}

    pydantic_qs = [QuestionSchema(**q) for q in raw if q.get("context")]
    logger.info("准备入库 %d 道题...", len(pydantic_qs))

    try:
        resp = submit_question_to_staging_tool.invoke({"questions": pydantic_qs})
        logger.info("落地反馈: %s", resp)
        return {"db_response": resp}
    except Exception as e:
        logger.error("入库异常: %s", e)
        return {"db_response": f"入库失败: {e}"}

# ==========================================
# 3. Agent 入口
# ==========================================

class QuestionAgent:
    """题库解析 Agent：滑动窗口 → AI 提取 → Staging 入库（含去重打标）。"""

    def __init__(self):
        self._app = self._build()

    def _build(self):
        g = StateGraph(QuestionState)
        g.add_node("slicer", sliding_window_slicer_node)
        g.add_node("extractor", extractor_node)
        g.add_node("saver", saver_node)
        g.add_edge(START, "slicer")
        g.add_edge("slicer", "extractor")
        g.add_edge("extractor", "saver")
        g.add_edge("saver", END)
        return g.compile()

    def run(self, content: str, outline_id: int) -> Dict[str, Any]:
        """
        启动解析流水线。
        :param content:     Markdown 原文
        :param outline_id:  归属大纲 ID
        :return: 包含 count / db_response / outline_id 的摘要
        """
        final = self._app.invoke({
            "document_content": content,
            "outline_id": int(outline_id),
            "errors": []
        })
        return {
            "success": True,
            "count": len(final.get("current_batch_results", [])),
            "db_response": final.get("db_response", ""),
            "outline_id": outline_id,
        }
