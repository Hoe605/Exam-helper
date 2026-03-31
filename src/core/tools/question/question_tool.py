from typing import List
from langchain_core.tools import tool
from src.core.schema.question import QuestionSchema
from src.core.services.question_service import save_questions_to_staging

# ==========================================
# Tool 定义 (仅包含外部调用封装和 Schema)
# ==========================================

@tool
def submit_question_to_staging_tool(questions: List[QuestionSchema]) -> str:
    """
    将 AI 提取的题目批量写入 Staging 缓冲区，自动标记疑似重复并溯源关联 ID。
    """
    # 直接调用逻辑单元 (Unit)
    return save_questions_to_staging(questions)
