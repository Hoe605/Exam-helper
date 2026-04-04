import logging
from ..state import ExtractState

logger = logging.getLogger(__name__)

WINDOW_SIZE = 2000
OVERLAP = 300

def slicing_node(state: ExtractState):
    """滑动窗口切分：固定窗口 + 重叠区，初始化待处理队列。"""
    content = state["document_content"]
    chunks = []
    start = 0
    while start < len(content):
        end = start + WINDOW_SIZE
        chunks.append(content[start:end])
        start += WINDOW_SIZE - OVERLAP
        if start >= len(content):
            break
            
    logger.info("切分完成 | 块数: %d", len(chunks))
    
    return {
        "raw_chunks": chunks,
        "pending_chunks": list(chunks), # 复制一份到待处理队列
        "total_count": len(chunks),
        "processed_count": 0,
        "extracted_questions": [],
        "db_stats": {"inserted": 0, "warnings": 0}
    }
