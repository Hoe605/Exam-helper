from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.db.session import get_db
from src.db.models import User
from src.core.auth.permissions import (
    assert_can_read_outline,
    assert_can_read_question,
    assert_can_write_outline,
    assert_can_write_question,
    get_readable_outline_ids,
    require_authenticated,
    require_teacher_or_admin,
)
from typing import List, Optional
from . import crud, schemas
from src.core.streaming import make_error_payload

router = APIRouter(
    tags=["library"]
)

@router.get("", response_model=schemas.QuestionListResponse)
def get_library_questions(
    outline_id: Optional[int] = Query(None, description="大纲 ID"),
    node_id: Optional[int] = Query(None, description="知识点 ID"),
    q_type: Optional[str] = Query(None, description="题型过滤"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(require_authenticated),
):
    """
    获取题库中的题目列表（支持按大纲 ID 或 节点 ID 过滤）
    """
    allowed_outline_ids = get_readable_outline_ids(db, user)
    if outline_id is not None:
        assert_can_read_outline(db, user, outline_id)
        total, items = crud.get_questions(db, outline_id=outline_id, node_id=node_id, q_type=q_type, skip=skip, limit=limit)
    else:
        total, items = crud.get_questions(
            db,
            outline_ids=allowed_outline_ids,
            node_id=node_id,
            q_type=q_type,
            skip=skip,
            limit=limit,
        )
    return {"total": total, "items": items}

@router.get("/{q_id}", response_model=schemas.Question)
def get_question_detail(
    q_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_authenticated),
):
    """
    获取题目详情（包含答案和解析）
    """
    assert_can_read_question(db, user, q_id)
    db_item = crud.get_question_by_id(db, q_id=q_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Question not found")
    return db_item

@router.delete("/{q_id}")
def delete_library_question(
    q_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher_or_admin),
):
    """
    从题库中删除题目
    """
    assert_can_write_question(db, user, q_id)
    success = crud.delete_question(db, q_id=q_id)
    if not success:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question deleted successfully"}

from src.core.agent.question.classify import QuestionClassifySDK

# 实例化分类 Agent SDK 单例
classify_sdk = QuestionClassifySDK()

@router.post("/{q_id}/classify")
async def classify_question(
    q_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher_or_admin),
):
    """
    智能解析题目归属：调用 Agent 将题目自动分类至所属章节（Level 2 节点）
    """
    assert_can_write_question(db, user, q_id)
    result = await classify_sdk.classify_question(q_id=q_id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=400, 
            detail=make_error_payload(
                "AI 引擎未能识别出合适的节点",
                code="QUESTION_CLASSIFICATION_FAILED",
                recoverable=True,
                details={"q_id": q_id, "errors": result["errors"]},
            )
        )
        
    return result

@router.post("/classify-uncategorized")
async def classify_uncategorized_questions(
    outline_id: int = Query(..., description="大纲 ID"),
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher_or_admin),
):
    """
    一键分类指定大纲下的所有未分类题目
    """
    assert_can_write_outline(db, user, outline_id)
    q_ids = crud.get_uncategorized_question_ids(db, outline_id=outline_id)
    if not q_ids:
        return {"message": "No uncategorized questions found", "processed_count": 0}
        
    results = []
    for q_id in q_ids:
        try:
            res = await classify_sdk.classify_question(q_id=q_id)
            results.append({"q_id": q_id, "success": res["success"]})
        except Exception as e:
            results.append({"q_id": q_id, "success": False, "error": str(e)})
            
    success_count = sum(1 for r in results if r["success"])
    return {
        "message": f"Processed {len(q_ids)} questions",
        "processed_count": len(q_ids),
        "success_count": success_count,
        "results": results
    }
