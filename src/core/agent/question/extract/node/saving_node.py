import logging
from ..tool import submit_question_tool
from ..schema import QuestionSchema
from ..state import ExtractState

logger = logging.getLogger(__name__)

def saving_node(state: ExtractState):
    """将提取结果批量写入 Staging 缓冲区。"""
    raw = state.get("current_batch_results", [])
    if not raw:
        return {"db_response": "未提取到题目"}

    pydantic_qs = [QuestionSchema(**q) for q in raw if q.get("context")]
    logger.info("准备入库 %d 道题...", len(pydantic_qs))

    try:
        resp = submit_question_tool.invoke({"questions": pydantic_qs})
        logger.info("落地反馈: %s", resp)
        return {"db_response": resp}
    except Exception as e:
        logger.error("入库异常: %s", e)
        return {"db_response": f"入库失败: {e}"}
