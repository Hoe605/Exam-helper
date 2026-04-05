from fastapi import Depends, HTTPException
from fastapi_users import FastAPIUsers
from sqlalchemy.orm import Session
from src.db.models import User, Outline
from src.db.session import get_db
from .jwt import auth_backend
from .manager import get_user_manager

fastapi_users = FastAPIUsers[User, int](
    get_user_manager,
    [auth_backend],
)

# 基础：登录用户
get_current_active_user = fastapi_users.current_user(active=True)

# 进阶：教师权限
def get_current_teacher(user: User = Depends(get_current_active_user)):
    """确保当前用户是教师或管理员"""
    if user.role not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=403, 
            detail="Forbidden: Teacher role required"
        )
    return user

# 终极：课程所有者校验 (假设 Outline 即 Course)
async def verify_course_owner(
    course_id: int, 
    user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """校验当前用户是否为指定大纲/课程的所有者"""
    outline = db.query(Outline).filter(Outline.id == course_id, Outline.is_deleted == False).first()
    if not outline:
        raise HTTPException(status_code=404, detail="Outline/Course not found")
    
    # 管理员拥有所有权限，普通教师仅限自己名下
    if user.role != "admin" and outline.teacher_id != user.id:
        raise HTTPException(
            status_code=403, 
            detail="Forbidden: You are not the owner of this course"
        )
    return outline
