from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, Dict, Any, List

class NodeMinimal(BaseModel):
    """
    节点极简结构 (ID + 名称 + 层级)
    """
    id: int
    name: str
    level: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)

class QuestionAnswerBase(BaseModel):
    """
    题目答案基础结构
    """
    answer_content: str
    analysis: Optional[str] = None

class QuestionBase(BaseModel):
    """
    题目核心基础结构
    """
    context: str
    options: Optional[Dict[str, Any]] = None
    q_type: Optional[str] = None
    outline_id: Optional[int] = None
    type: Optional[str] = None
    difficulty: Optional[int] = 1

class Question(QuestionBase):
    """
    题库题目完整结构
    """
    id: int
    answer: Optional[QuestionAnswerBase] = None
    nodes: List[NodeMinimal] = []
    
    model_config = ConfigDict(from_attributes=True)

class QuestionListResponse(BaseModel):
    """
    获分列题后的响应格式 (包含总数，方便前端分页)
    """
    total: int
    items: List[Question]
