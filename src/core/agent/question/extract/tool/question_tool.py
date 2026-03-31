from typing import List
from langchain_core.tools import tool
from ..schema.question_schema import QuestionSchema
from src.core.services.question_service import save_questions_to_staging

@tool
def submit_question_tool(questions: List[QuestionSchema]) -> str:
    """
    题目提取提交工具。
    将从当前文本块中识别出的结构化题目列表（单选、多选、填空、解答等）提交至系统暂存区。
    系统会自动进行相似度去重检查并关联归属的大纲节点。
    """
    return save_questions_to_staging(questions)
