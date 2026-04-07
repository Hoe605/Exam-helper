from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from src.db.session import get_db
from .service import CourseService
from . import schemas
from src.core.auth.fastapi_users import fastapi_users
from src.db.models import User
from typing import List

current_active_user = fastapi_users.current_user(active=True)

router = APIRouter(
    prefix="/courses",
    tags=["course"]
)

@router.post("", response_model=schemas.Course)
async def create_course(
    course: schemas.CourseCreate,
    db: Session = Depends(get_db),
    user: User = Depends(current_active_user)
):
    """创建新课程"""
    if user.role not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Unauthorized role")
        
    result = await CourseService.create_course(db, course.name, course.desc, user.id)
    return result

@router.post("/join", response_model=schemas.Course)
async def join_course(
    join_data: schemas.CourseJoin,
    db: Session = Depends(get_db),
    user: User = Depends(current_active_user)
):
    """学生通过验证码加入课程"""
    course = await CourseService.join_course(db, join_data.code, user.id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or invalid code")
    return course

@router.get("", response_model=List[schemas.Course])
async def list_courses(
    db: Session = Depends(get_db),
    user: User = Depends(current_active_user)
):
    """列出我当前参与的所有课程"""
    return await CourseService.get_user_courses(db, user.id)

@router.get("/{course_id}/outlines")
async def get_course_outlines(
    course_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(current_active_user)
):
    """获取课程关联的所有大纲"""
    return await CourseService.get_course_outlines(db, course_id)
