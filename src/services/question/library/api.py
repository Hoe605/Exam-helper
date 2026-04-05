from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.db.session import get_db
from typing import List, Optional
from . import crud, schemas

router = APIRouter(
    tags=["library"]
)

@router.get("/", response_model=schemas.QuestionListResponse)
def get_library_questions(
    outline_id: Optional[int] = Query(None, description="大纲 ID"),
    q_type: Optional[str] = Query(None, description="题型过滤"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    获取题库中的题目列表（支持按大纲 ID 过滤）
    """
    total, items = crud.get_questions(db, outline_id=outline_id, q_type=q_type, skip=skip, limit=limit)
    return {"total": total, "items": items}

@router.get("/{q_id}", response_model=schemas.Question)
def get_question_detail(q_id: int, db: Session = Depends(get_db)):
    """
    获取题目详情（包含答案和解析）
    """
    db_item = crud.get_question_by_id(db, q_id=q_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Question not found")
    return db_item

@router.delete("/{q_id}")
def delete_library_question(q_id: int, db: Session = Depends(get_db)):
    """
    从题库中删除题目
    """
    success = crud.delete_question(db, q_id=q_id)
    if not success:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question deleted successfully"}

from src.core.agent.question.classify import QuestionClassifySDK

# 实例化分类 Agent SDK 单例
classify_sdk = QuestionClassifySDK()

@router.post("/{q_id}/classify")
async def classify_question(q_id: int):
    """
    智能解析题目归属：调用 Agent 将题目自动分类至所属章节（Level 2 节点）
    """
    result = await classify_sdk.classify_question(q_id=q_id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=400, 
            detail={"errors": result["errors"]}
        )
        
    return result
