from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime

class QuestionStagingBase(BaseModel):
    q_type: Optional[str] = None
    context: str
    options: Optional[Dict[str, Any]] = None
    type: Optional[str] = None
    status: Optional[str] = "pending"
    is_warning: Optional[bool] = False
    warning_reason: Optional[str] = None
    duplicate_of_id: Optional[int] = None
    duplicate_of_formal_id: Optional[int] = None
    outline_id: Optional[int] = None
    error_msg: Optional[str] = None
    difficulty: Optional[int] = 1

class QuestionStagingUpdate(BaseModel):
    status: Optional[str] = None
    context: Optional[str] = None
    options: Optional[Dict[str, Any]] = None
    is_warning: Optional[bool] = None

class QuestionStaging(QuestionStagingBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class DuplicateResolve(BaseModel):
    keep_id: int
    discard_id: int
