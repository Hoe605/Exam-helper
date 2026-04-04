import logging
from ..tool import submit_question_tool
from ..schema import QuestionSchema
from ..state import ExtractState

logger = logging.getLogger(__name__)

import re

def saving_node(state: ExtractState):
    """单核存库节点：将当前批次提取出的题目增量写入 Staging。"""
    raw = state.get("current_batch_results", [])
    processed_count = state.get("processed_count", 0) + 1
    total_stats = state.get("db_stats", {"inserted": 0, "warnings": 0})
    
    if not raw:
        logger.info("本批次无题目，仅跳过计数。")
        return {
            "processed_count": processed_count,
            "db_stats": total_stats
        }

    pydantic_qs = [QuestionSchema(**q) for q in raw if q.get("context")]
    
    try:
        resp = submit_question_tool.invoke({"questions": pydantic_qs})
        logger.info("原子入库成功: %s", resp)
        
        # 解析反馈字符串以累加统计: "Staging 入库成功 | 总量: 2 | 标记可疑: 1"
        try:
            total_match = re.search(r"总量: (\d+)", resp)
            warn_match = re.search(r"标记可疑: (\d+)", resp)
            
            if total_match:
                total_stats["inserted"] += int(total_match.group(1))
            if warn_match:
                total_stats["warnings"] += int(warn_match.group(1))
        except Exception:
            pass
            
        return {
            "processed_count": processed_count,
            "db_stats": total_stats,
            "extracted_questions": state.get("extracted_questions", []) + raw
        }
    except Exception as e:
        logger.error("原子入库异常: %s", e)
        return {
            "processed_count": processed_count,
            "errors": state.get("errors", []) + [str(e)]
        }
