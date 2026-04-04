from sqlalchemy.orm import Session, joinedload
from src.db.models import Question, QuestionAnswer
from typing import List, Optional

def get_questions(
    db: Session, 
    outline_id: Optional[int] = None, 
    q_type: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100
):
    """
    获分题目列表
    支持大纲过滤、题型过滤以及分页
    """
    query = db.query(Question).options(joinedload(Question.answer))
    
    if outline_id:
        query = query.filter(Question.outline_id == outline_id)
        
    if q_type:
        query = query.filter(Question.q_type == q_type)
        
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    
    return total, items

def get_question_by_id(db: Session, q_id: int):
    """
    根据 ID 获取单个题目（含解析）
    """
    return db.query(Question).options(joinedload(Question.answer)).filter(Question.id == q_id).first()

def delete_question(db: Session, q_id: int) -> bool:
    """
    物理删除正式库中的题目
    """
    db_item = db.query(Question).filter(Question.id == q_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False
