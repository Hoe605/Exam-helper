from typing import List, Optional
from langchain_core.tools import tool
from pydantic import BaseModel, Field

from src.db.session import SessionLocal
from src.db.models import Outline, Node, Question, QuestionStaging
from src.core.schema.outline import OutlineNode

# ==========================================
# 辅助函数：Jaccard 相似度
# ==========================================

SIMILARITY_THRESHOLD = 0.6
MIN_CONTEXT_LENGTH = 20


def _trigrams(text: str) -> set:
    """提取字符三元组集合。"""
    if not text:
        return set()
    t = "".join(text.split())
    return {t[i:i+3] for i in range(len(t) - 2)} if len(t) >= 3 else {t}


def _jaccard_similarity(a: str, b: str) -> float:
    """计算两段文本的 Jaccard 相似度。"""
    ga, gb = _trigrams(a), _trigrams(b)
    union = len(ga | gb)
    return len(ga & gb) / union if union > 0 else 0.0


def _is_similar(a: str, b: str) -> bool:
    """判断两段文本是否"疑似重复"（包含关系 或 Jaccard 超阈值）。"""
    return (a in b) or (b in a) or (_jaccard_similarity(a, b) > SIMILARITY_THRESHOLD)


# ==========================================
# Pydantic Schema
# ==========================================

class QuestionSchema(BaseModel):
    q_type: str = Field(description="题型")
    context: str = Field(description="题目正文")
    options: Optional[dict] = Field(None, description="选项")
    outline_id: Optional[int] = Field(None, description="所属大纲 ID")
    type: str = Field(default="真题", description="来源类型")


# ==========================================
# Tool：题目暂存
# ==========================================

@tool
def submit_question_to_staging_tool(questions: List[QuestionSchema]) -> str:
    """
    将 AI 提取的题目批量写入 Staging 缓冲区，自动标记疑似重复并溯源关联 ID。
    """
    if not questions:
        return "未发现题目。"

    db = SessionLocal()
    inserted = 0
    warnings = 0
    try:
        existing_rows = db.query(QuestionStaging.id, QuestionStaging.context).all()
        batch_seen: list[tuple[int, str]] = []
        sorted_q = sorted(questions, key=lambda x: len(x.context), reverse=True)

        for q in sorted_q:
            is_warning = False
            reason = None
            dup_id = None

            # 碎片检测
            if len(q.context.strip()) < MIN_CONTEXT_LENGTH:
                is_warning = True
                reason = "短碎块"

            # 库内溯源
            if not is_warning:
                for ex_id, ex_ctx in existing_rows:
                    if _is_similar(q.context, ex_ctx):
                        is_warning = True
                        dup_id = ex_id
                        reason = f"相似({ex_id})"
                        break

            # 批次内溯源
            if not is_warning:
                for b_id, b_ctx in batch_seen:
                    if _is_similar(q.context, b_ctx):
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


# ==========================================
# Tool：大纲预览 & 入库
# ==========================================

@tool
def preview_outline_tool(nodes: List[OutlineNode]) -> str:
    """
    控制台打印考纲层级结构（不入库）。
    """
    for node in nodes:
        d = node.dict() if hasattr(node, "dict") else node
        indent = "  " * (d.get("level", 1) - 1)
        print(f"{indent}└─ [{d.get('level')}] {d.get('name')}")
    return f"预览完成：共 {len(nodes)} 个节点"


@tool
def submit_outline_extraction_tool(
    nodes: List[OutlineNode],
    name: str = "默认大纲",
    description: str = "",
) -> str:
    """
    将考纲知识点列表持久化到数据库。
    """
    db = SessionLocal()
    try:
        with db.begin():
            # 1. 创建大纲主记录
            o = Outline(name=name, desc=description)
            db.add(o)
            db.flush()

            # 2. 批量创建节点并记录映射关系
            name_to_id = {}
            for n in nodes:
                db_node = Node(
                    outline_id=o.id,
                    name=n.name,
                    desc=n.description,
                    level=n.level,
                )
                db.add(db_node)
                db.flush()  # 获取自增 ID
                name_to_id[n.name] = db_node.id

            # 3. 建立父子平衡树关系
            for n in nodes:
                if n.parent_name and n.parent_name in name_to_id:
                    child_id = name_to_id[n.name]
                    parent_id = name_to_id[n.parent_name]
                    db.query(Node).filter(Node.id == child_id).update({"f_node": parent_id})

        return f"✅ 成功持久化 {len(nodes)} 个考纲节点到数据库 (ID: {o.id})"
    except Exception as e:
        return f"❌ 大纲入库失败: {e}"
    finally:
        db.close()
