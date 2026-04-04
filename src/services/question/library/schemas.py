from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List

class QuestionAnswerBase(BaseModel):
    """
    题目答案基础结构
    """
    answer_content: str
    analysis: Optional[str] = None

class QuestionAnswer(QuestionAnswerBase):
    """
    题目答案完整结构
    """
    question_id: int
    
    model_config = ConfigDict(from_attributes=True)

class QuestionBase(BaseModel):
    """
    题目核心基础结构
    """
    context: str
    options: Optional[Dict[str, Any]] = None
    q_type: Optional[str] = None
    outline_id: Optional[int] = None
    type: Optional[str] = None

class Question(QuestionBase):
    """
    题库题目完整结构
    """
    id: int
    answer: Optional[QuestionAnswerBase] = None
    
    model_config = ConfigDict(from_attributes=True)

class QuestionListResponse(BaseModel):
    """
    获分列题后的响应格式 (包含总数，方便前端分页)
    """
    total: int
    items: List[Question]
