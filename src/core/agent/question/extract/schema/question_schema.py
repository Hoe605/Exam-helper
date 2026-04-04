from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class QuestionSchema(BaseModel):
    """
    题目提取 Schema (用于 AI 结构化输出)
    """
    q_type: str = Field(description="题目类型，如：'单项选择题', '多项选择题', '填空题', '解答题'")
    context: str = Field(description="题目正文内容，包含题干")
    options: Optional[Dict[str, str]] = Field(default=None, description="选项列表（仅选择题需要）")

    # 以下字段由 Node 自动填充，不建议由 LLM 直接提取，但保留在 Schema 中以符合 Service 入库规范
    type: Optional[str] = Field(default=None, description="题目来源/分类")
    outline_id: Optional[int] = Field(default=None, description="归属大纲 ID")
