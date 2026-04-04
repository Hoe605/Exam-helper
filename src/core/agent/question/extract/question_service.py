from typing import List, Tuple
from src.db.session import SessionLocal
from src.db.models import QuestionStaging

# ==========================================
# 文本重复度检测 (Jaccard) - 专为数据库去重服务
# ==========================================

SIMILARITY_THRESHOLD = 0.6
MIN_CONTEXT_LENGTH = 20

def normalize_text(text: str) -> str:
    """
    为相似度计算准备的文本归一化处理。
    去除格式符号并统一数学表示。
    """
    if not text:
        return ""

    # 1. 移除 Markdown/LaTeX 边界符
    text = text.replace("$", "").replace("**", "").replace("*", "").replace("_", "")

    # 2. 统一 Unicode 数学符号 (例如 ² -> ^2)
    unicode_map = {
        "²": "^2",
        "³": "^3",
        "＋": "+",
        "－": "-",
        "×": "*",
        "÷": "/",
        "＝": "=",
    }
    for old, new in unicode_map.items():
        text = text.replace(old, new)

    # 3. 移除文本内部所有空白字符并转小写
    text = "".join(text.split()).lower()
    return text

def get_trigrams(text: str) -> set:
    """提取字符三元组集合。"""
    if not text:
        return set()
    # 已经是 normalize 过的文本应无需再次 join，但为了健壮性保留
    t = "".join(text.split())
    return {t[i:i+3] for i in range(len(t) - 2)} if len(t) >= 3 else {t}

def jaccard_similarity(a: str, b: str) -> float:
    """计算两段文本的 Jaccard 相似度。"""
    ga, gb = get_trigrams(a), get_trigrams(b)
    union = len(ga | gb)
    return len(ga & gb) / union if union > 0 else 0.0

def is_similar_text(a: str, b: str, threshold: float = SIMILARITY_THRESHOLD) -> bool:
    """判断两段文本是否"疑似重复"（归一化后的包含关系 或 Jaccard 超阈值）。"""
    na, nb = normalize_text(a), normalize_text(b)
    if (na in nb) or (nb in na):
        return True
    return jaccard_similarity(na, nb) > threshold

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
        # 1. 加载暂存区已有项
        existing_staging_rows = db.query(QuestionStaging.id, QuestionStaging.context).all()
        # 2. 加载正式库已有项
        from src.db.models import Question
        formal_rows = db.query(Question.id, Question.context).all()
        
        batch_seen: List[Tuple[int, str]] = []
        
        # 按长度降序排列，优先处理长文本（包含关系判定更精确）
        sorted_q = sorted(questions, key=lambda x: len(x.context), reverse=True)

        for q in sorted_q:
            is_warning = False
            reason = None
            dup_id = None
            dup_formal_id = None
            db_original_item = None
            batch_original_item = None

            # A. 碎片检测
            if len(q.context.strip()) < MIN_CONTEXT_LENGTH:
                is_warning = True
                reason = "短碎块"

            # B. 正式库溯源 (最高优先级)
            if not is_warning:
                for f_id, f_ctx in formal_rows:
                    if is_similar_text(q.context, f_ctx):
                        is_warning = True
                        reason = f"与正式库 #{f_id} 相似"
                        dup_formal_id = f_id
                        break

            # C. 暂存区溯源 (相似度检查)
            if not is_warning:
                for ex_id, ex_ctx in existing_staging_rows:
                    if is_similar_text(q.context, ex_ctx):
                        is_warning = True
                        dup_id = ex_id
                        reason = f"与库内 #{ex_id} 相似"
                        
                        # 【双向标记】准备更新库内已有项
                        db_original_item = db.query(QuestionStaging).filter(QuestionStaging.id == ex_id).first()
                        if db_original_item and db_original_item.status != "warning":
                            db_original_item.status = "warning"
                            db_original_item.is_warning = True
                            db_original_item.warning_reason = f"发现新入库冲突项"
                        break

            # 3. 批次内溯源 (同库内逻辑)
            if not is_warning:
                for b_id, b_ctx in batch_seen:
                    if is_similar_text(q.context, b_ctx):
                        is_warning = True
                        dup_id = b_id
                        reason = f"与批次内 #{b_id} 相似"
                        
                        # 【双向标记】准备更新本批次内已有项
                        batch_original_item = db.query(QuestionStaging).filter(QuestionStaging.id == b_id).first()
                        if batch_original_item and batch_original_item.status != "warning":
                            batch_original_item.status = "warning"
                            batch_original_item.is_warning = True
                            batch_original_item.warning_reason = f"发现批次内重复项"
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

            # 【核心修复】反向更新原项的 duplicate_of_id，确保两边都能点开对比
            if db_original_item:
                db_original_item.duplicate_of_id = row.id
            if batch_original_item:
                batch_original_item.duplicate_of_id = row.id

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
