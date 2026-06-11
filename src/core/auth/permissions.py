from fastapi import Depends, HTTPException, status
from sqlalchemy import exists, or_, select
from sqlalchemy.orm import Session

from src.core.auth.fastapi_users import get_current_active_user
from src.db.models import (
    Course,
    CourseOutlineMapping,
    CourseUserMapping,
    Node,
    Outline,
    Question,
    QuestionStaging,
    User,
)
from src.db.session import get_db


def is_admin(user: User) -> bool:
    return bool(user.is_superuser or user.role == "admin")


def is_teacher(user: User) -> bool:
    return bool(is_admin(user) or user.role == "teacher")


def require_admin(user: User = Depends(get_current_active_user)) -> User:
    if not is_admin(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required")
    return user


def require_teacher_or_admin(user: User = Depends(get_current_active_user)) -> User:
    if not is_teacher(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher role required")
    return user


def require_authenticated(user: User = Depends(get_current_active_user)) -> User:
    return user


def _course_member_exists(db: Session, user_id: int, outline_id: int) -> bool:
    return db.query(
        exists().where(
            CourseOutlineMapping.outline_id == outline_id,
            CourseOutlineMapping.course_id == CourseUserMapping.course_id,
            CourseUserMapping.user_id == user_id,
        )
    ).scalar()


def _course_teacher_exists(db: Session, user_id: int, outline_id: int) -> bool:
    return db.query(
        exists().where(
            CourseOutlineMapping.outline_id == outline_id,
            CourseOutlineMapping.course_id == Course.id,
            Course.creator_id == user_id,
        )
    ).scalar()


def can_read_outline(db: Session, user: User, outline: Outline) -> bool:
    if is_admin(user):
        return True
    if outline.teacher_id == user.id:
        return True
    return _course_member_exists(db, user.id, outline.id)


def can_write_outline(db: Session, user: User, outline: Outline) -> bool:
    if is_admin(user):
        return True
    if user.role != "teacher":
        return False
    if outline.teacher_id == user.id:
        return True
    return _course_teacher_exists(db, user.id, outline.id)


def assert_can_read_course(db: Session, user: User, course_id: int) -> Course:
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if is_admin(user) or course.creator_id == user.id:
        return course
    member_exists = db.query(
        exists().where(
            CourseUserMapping.course_id == course_id,
            CourseUserMapping.user_id == user.id,
        )
    ).scalar()
    if not member_exists:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Course access denied")
    return course


def assert_can_teach_course(db: Session, user: User, course_id: int) -> Course:
    course = assert_can_read_course(db, user, course_id)
    if is_admin(user) or course.creator_id == user.id:
        return course
    teacher_exists = db.query(
        exists().where(
            CourseUserMapping.course_id == course_id,
            CourseUserMapping.user_id == user.id,
            CourseUserMapping.role == "teacher",
        )
    ).scalar()
    if not teacher_exists:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Course teacher access denied")
    return course


def assert_can_read_outline(db: Session, user: User, outline_id: int) -> Outline:
    outline = db.query(Outline).filter(
        Outline.id == outline_id,
        or_(Outline.is_deleted == False, Outline.is_deleted.is_(None)),
    ).first()
    if not outline:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outline not found")
    if not can_read_outline(db, user, outline):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Outline access denied")
    return outline


def assert_can_write_outline(db: Session, user: User, outline_id: int) -> Outline:
    outline = assert_can_read_outline(db, user, outline_id)
    if not can_write_outline(db, user, outline):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Outline write access denied")
    return outline


def get_readable_outline_ids(db: Session, user: User) -> list[int] | None:
    if is_admin(user):
        return None

    owned = select(Outline.id).where(
        Outline.teacher_id == user.id,
        or_(Outline.is_deleted == False, Outline.is_deleted.is_(None)),
    )
    course_linked = (
        select(CourseOutlineMapping.outline_id)
        .join(CourseUserMapping, CourseUserMapping.course_id == CourseOutlineMapping.course_id)
        .where(CourseUserMapping.user_id == user.id)
    )
    ids = set(db.execute(owned).scalars().all())
    ids.update(db.execute(course_linked).scalars().all())
    return list(ids)


def get_writable_outline_ids(db: Session, user: User) -> list[int] | None:
    if is_admin(user):
        return None
    if user.role != "teacher":
        return []

    owned = select(Outline.id).where(
        Outline.teacher_id == user.id,
        or_(Outline.is_deleted == False, Outline.is_deleted.is_(None)),
    )
    course_created = (
        select(CourseOutlineMapping.outline_id)
        .join(Course, Course.id == CourseOutlineMapping.course_id)
        .where(Course.creator_id == user.id)
    )
    ids = set(db.execute(owned).scalars().all())
    ids.update(db.execute(course_created).scalars().all())
    return list(ids)


def assert_can_read_node(db: Session, user: User, node_id: int) -> Node:
    node = db.query(Node).filter(Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Node not found")
    assert_can_read_outline(db, user, node.outline_id)
    return node


def assert_can_write_node(db: Session, user: User, node_id: int) -> Node:
    node = assert_can_read_node(db, user, node_id)
    assert_can_write_outline(db, user, node.outline_id)
    return node


def assert_can_read_question(db: Session, user: User, q_id: int) -> Question:
    question = db.query(Question).filter(Question.id == q_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    if question.outline_id is not None:
        assert_can_read_outline(db, user, question.outline_id)
    elif not is_admin(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Question access denied")
    return question


def assert_can_write_question(db: Session, user: User, q_id: int) -> Question:
    question = assert_can_read_question(db, user, q_id)
    if question.outline_id is not None:
        assert_can_write_outline(db, user, question.outline_id)
    elif not is_admin(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Question write access denied")
    return question


def assert_can_read_staging(db: Session, user: User, staging_id: int) -> QuestionStaging:
    item = db.query(QuestionStaging).filter(QuestionStaging.id == staging_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    if item.outline_id is not None:
        assert_can_read_outline(db, user, item.outline_id)
    elif not is_admin(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staging item access denied")
    return item


def assert_can_write_staging(db: Session, user: User, staging_id: int) -> QuestionStaging:
    item = assert_can_read_staging(db, user, staging_id)
    if item.outline_id is not None:
        assert_can_write_outline(db, user, item.outline_id)
    elif not is_admin(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staging item write access denied")
    return item


def get_permission_context(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> tuple[Session, User]:
    return db, user
