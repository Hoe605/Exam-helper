from typing import List, Tuple
from src.db.session import SessionLocal
from src.db.models import QuestionStaging

# ==========================================
# 文本重复度检测 (Jaccard) - 专为数据库去重服务
# ==========================================

SIMILARITY_THRESHOLD = 0.6
MIN_CONTEXT_LENGTH = 20

def get_trigrams(text: str) -> set:
    """提取字符三元组集合。"""
    if not text:
        return set()
    t = "".join(text.split())
    return {t[i:i+3] for i in range(len(t) - 2)} if len(t) >= 3 else {t}

def jaccard_similarity(a: str, b: str) -> float:
    """计算两段文本的 Jaccard 相似度。"""
    ga, gb = get_trigrams(a), get_trigrams(b)
    union = len(ga | gb)
    return len(ga & gb) / union if union > 0 else 0.0

def is_similar_text(a: str, b: str, threshold: float = SIMILARITY_THRESHOLD) -> bool:
    """判断两段文本是否"疑似重复"（包含关系 或 Jaccard 超阈值）。"""
    return (a in b) or (b in a) or (jaccard_similarity(a, b) > threshold)

# ==========================================
# 核心业务逻辑：题目暂存入库
# ==========================================

def save_questions_to_staging(questions: List[any]) -> str:
    """
    将题目列表保存到暂存区，包含去重和提示标记。
    """
    if not questions:
        return "未发现题目。"

    db = SessionLocal()
    inserted = 0
    warnings = 0
    try:
        existing_rows = db.query(QuestionStaging.id, QuestionStaging.context).all()
        batch_seen: List[Tuple[int, str]] = []
        
        # 按长度降序排列，优先处理长文本（包含关系判定更精确）
        sorted_q = sorted(questions, key=lambda x: len(x.context), reverse=True)

        for q in sorted_q:
            is_warning = False
            reason = None
            dup_id = None

            # 1. 碎片检测
            if len(q.context.strip()) < MIN_CONTEXT_LENGTH:
                is_warning = True
                reason = "短碎块"

            # 2. 库内溯源 (相似度检查)
            if not is_warning:
                for ex_id, ex_ctx in existing_rows:
                    if is_similar_text(q.context, ex_ctx):
                        is_warning = True
                        dup_id = ex_id
                        reason = f"相似({ex_id})"
                        break

            # 3. 批次内溯源
            if not is_warning:
                for b_id, b_ctx in batch_seen:
                    if is_similar_text(q.context, b_ctx):
                        is_warning = True
                        dup_id = b_id
                        reason = f"同批重复({b_id})"
                        break

            row = QuestionStaging(
                q_type=q.q_type,
                context=q.context,
                options=q.options,
                type=q.type,
                outline_id=q.outline_id,
                status="warning" if is_warning else "pending",
                is_warning=is_warning,
                warning_reason=reason,
                duplicate_of_id=dup_id,
            )
            db.add(row)
            db.flush()

            batch_seen.append((row.id, q.context))
            inserted += 1
            if is_warning:
                warnings += 1

        db.commit()
        return f"Staging 入库成功 | 总量: {inserted} | 标记可疑: {warnings}"
    except Exception as e:
        db.rollback()
        return f"Staging 入库失败: {e}"
    finally:
        db.close()
