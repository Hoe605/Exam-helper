import random
import string
from sqlalchemy.orm import Session
from sqlalchemy import select
from src.db.models import Course, CourseUserMapping, CourseOutlineMapping, User
from typing import List, Optional

def generate_course_code(length: int = 6) -> str:
    """生成唯一的课程邀请码"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

class CourseService:
    @staticmethod
    async def create_course(db: Session, name: str, desc: str, creator_id: int) -> Course:
        # 确保生成的 code 是唯一的
        while True:
            code = generate_course_code()
            existing = db.execute(select(Course).where(Course.code == code)).scalar_one_or_none()
            if not existing:
                break
        
        course = Course(
            name=name,
            desc=desc,
            code=code,
            creator_id=creator_id
        )
        db.add(course)
        db.commit()
        db.refresh(course)
        
        # 同时将创建者作为教师加入关联表
        mapping = CourseUserMapping(
            course_id=course.id,
            user_id=creator_id,
            role="teacher"
        )
        db.add(mapping)
        db.commit()
        
        return course

    @staticmethod
    async def join_course(db: Session, code: str, user_id: int) -> Optional[Course]:
        # 查找课程
        course = db.execute(select(Course).where(Course.code == code.upper())).scalar_one_or_none()
        if not course:
            return None
        
        # 检查是否已经加入
        existing_mapping = db.execute(
            select(CourseUserMapping).where(
                CourseUserMapping.course_id == course.id,
                CourseUserMapping.user_id == user_id
            )
        ).scalar_one_or_none()
        
        if existing_mapping:
            return course
        
        # 加入课程
        mapping = CourseUserMapping(
            course_id=course.id,
            user_id=user_id,
            role="student"
        )
        db.add(mapping)
        db.commit()
        
        return course

    @staticmethod
    async def get_user_courses(db: Session, user_id: int) -> List[Course]:
        # 获取用户参与的所有课程
        mappings = db.execute(
            select(CourseUserMapping).where(CourseUserMapping.user_id == user_id)
        ).scalars().all()
        
        course_ids = [m.course_id for m in mappings]
        if not course_ids:
            return []
            
        courses = db.execute(
            select(Course).where(Course.id.in_(course_ids))
        ).scalars().all()
        
        return list(courses)

    @staticmethod
    async def link_outline(db: Session, course_id: int, outline_id: int) -> bool:
        # 建立大纲与课程的连接
        existing = db.execute(
            select(CourseOutlineMapping).where(
                CourseOutlineMapping.course_id == course_id,
                CourseOutlineMapping.outline_id == outline_id
            )
        ).scalar_one_or_none()
        
        if existing:
            return True
            
        mapping = CourseOutlineMapping(
            course_id=course_id,
            outline_id=outline_id
        )
        db.add(mapping)
        db.commit()
        return True

    @staticmethod
    async def get_course_outlines(db: Session, course_id: int):
        mappings = db.execute(
            select(CourseOutlineMapping).where(CourseOutlineMapping.course_id == course_id)
        ).scalars().all()
        
        from src.db.models import Outline
        outline_ids = [m.outline_id for m in mappings]
        if not outline_ids:
            return []
            
        outlines = db.execute(
            select(Outline).where(Outline.id.in_(outline_ids))
        ).scalars().all()
        
        return list(outlines)
