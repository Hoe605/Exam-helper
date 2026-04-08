from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CourseBase(BaseModel):
    name: str = "默认课程"
    desc: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: int
    code: str
    is_active: bool
    created_at: datetime
    creator_id: int

    class Config:
        from_attributes = True

class CourseJoin(BaseModel):
    code: str

class CourseStudent(BaseModel):
    id: int
    email: str
    role: str

    class Config:
        from_attributes = True
