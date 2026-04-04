from sqlalchemy.orm import Session
from src.db.models import QuestionStaging, Question
from . import schemas
from typing import List, Optional

def get_staging_questions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(QuestionStaging).filter(QuestionStaging.status != "approved").order_by(QuestionStaging.created_at.desc()).offset(skip).limit(limit).all()

def get_staging_item(db: Session, staging_id: int):
    return db.query(QuestionStaging).filter(QuestionStaging.id == staging_id).first()

def get_formal_item(db: Session, q_id: int):
    return db.query(Question).filter(Question.id == q_id).first()

def get_staging_by_status(db: Session, status: str):
    return db.query(QuestionStaging).filter(QuestionStaging.status == status).all()

def update_staging(db: Session, staging_id: int, update: schemas.QuestionStagingUpdate):
    db_item = db.query(QuestionStaging).filter(QuestionStaging.id == staging_id).first()
    if not db_item:
        return None
    
    # 记录原状态，判断是否正在变更为 'approved'
    old_status = db_item.status
    update_data = update.model_dump(exclude_unset=True)
    
    # 更新暂存表数据
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    # 获取用于返回的数据对象（避免删除后无法访问）
    result_data = {
        "id": db_item.id,
        "context": db_item.context,
        "options": db_item.options,
        "q_type": db_item.q_type,
        "type": db_item.type,
        "status": db_item.status,
        "is_warning": db_item.is_warning,
        "warning_reason": db_item.warning_reason,
        "duplicate_of_id": db_item.duplicate_of_id,
        "duplicate_of_formal_id": db_item.duplicate_of_formal_id,
        "outline_id": db_item.outline_id,
        "error_msg": db_item.error_msg,
        "created_at": db_item.created_at
    }

    # 如果状态变更为 'approved'，则同步到正式题目表
    if db_item.status == "approved" and old_status != "approved":
        new_q = Question(
            context=db_item.context,
            options=db_item.options,
            q_type=db_item.q_type,
            outline_id=db_item.outline_id,
            type=db_item.type
        )
        db.add(new_q)
        # 一旦成功入库，直接物理删除暂存表项，保持暂存池清爽
        db.delete(db_item)
        
    db.commit()
    return result_data

def delete_staging(db: Session, staging_id: int):
    db_item = db.query(QuestionStaging).filter(QuestionStaging.id == staging_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False

def get_staging_stats(db: Session):
    total = db.query(QuestionStaging).count()
    pending = db.query(QuestionStaging).filter(QuestionStaging.status == "pending").count()
    warning = db.query(QuestionStaging).filter(QuestionStaging.status == "warning").count()
    approved = db.query(QuestionStaging).filter(QuestionStaging.status == "approved").count()
    return {
        "total": total,
        "pending": pending,
        "warning": warning,
        "approved": approved
    }

def resolve_duplicate(db: Session, keep_id: int, discard_id: int):
    """
    原子化处理重复冲突：
    1. 保留项：存入正式 Question 表，并在暂存表标记为 approved
    2. 丢弃项：从暂存表中物理删除
    """
    keep_item = db.query(QuestionStaging).filter(QuestionStaging.id == keep_id).first()
    discard_item = db.query(QuestionStaging).filter(QuestionStaging.id == discard_id).first()
    
    if not keep_item or not discard_item:
        return False
        
    try:
        # 建立正式题目记录
        new_q = Question(
            context=keep_item.context,
            options=keep_item.options,
            q_type=keep_item.q_type,
            outline_id=keep_item.outline_id,
            type=keep_item.type
        )
        db.add(new_q)
        
        # 删除保留项（因为它已经进正式表了）
        db.delete(keep_item)
        
        # 删除丢弃项
        db.delete(discard_item)
        
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        return False

def approve_all_pending(db: Session) -> int:
    """
    一键通过所有非冲突项 (status == 'pending')
    返回成功处理的数量
    """
    pending_items = db.query(QuestionStaging).filter(QuestionStaging.status == "pending", QuestionStaging.is_warning == False).all()
    count = 0
    
    try:
        for item in pending_items:
            # 建立正式题目记录
            new_q = Question(
                context=item.context,
                options=item.options,
                q_type=item.q_type,
                outline_id=item.outline_id,
                type=item.type
            )
            db.add(new_q)
            # 物理删除已通过的项
            db.delete(item)
            count += 1
        
        db.commit()
        return count
    except Exception as e:
        db.rollback()
        raise e
