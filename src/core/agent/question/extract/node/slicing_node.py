import logging
from ..state import ExtractState

logger = logging.getLogger(__name__)

WINDOW_SIZE = 2000
OVERLAP = 300

def slicing_node(state: ExtractState):
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
