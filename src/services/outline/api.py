from fastapi import APIRouter, Depends, HTTPException, Body, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from src.db.session import get_db
from src.db.models import User
from src.core.auth.permissions import (
    assert_can_read_outline,
    assert_can_write_outline,
    get_readable_outline_ids,
    require_authenticated,
    require_teacher_or_admin,
)
from . import crud, schemas
from .agent_manager import agent_manager
from src.core.agent.outline.outline_agent import run_outline_extraction_stream
import asyncio
from typing import List
from fastapi.encoders import jsonable_encoder
from src.core.streaming import StreamRun

router = APIRouter(
    prefix="/outlines",
    tags=["outline"]
)

@router.get("", response_model=List[schemas.Outline])
def read_outlines(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: User = Depends(require_authenticated),
):
    outline_ids = get_readable_outline_ids(db, user)
    return crud.get_outlines(db, skip=skip, limit=limit, outline_ids=outline_ids)

@router.get("/{outline_id}", response_model=schemas.Outline)
def read_outline(
    outline_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_authenticated),
):
    assert_can_read_outline(db, user, outline_id)
    db_outline = crud.get_outline(db, outline_id=outline_id)
    if not db_outline:
        raise HTTPException(status_code=404, detail="Outline not found")
    return db_outline

@router.post("", response_model=schemas.Outline)
def create_outline(
    outline: schemas.OutlineCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher_or_admin),
):
    return crud.create_outline(db=db, outline=outline, teacher_id=user.id)

@router.put("/{outline_id}", response_model=schemas.Outline)
def update_outline(
    outline_id: int,
    outline: schemas.OutlineUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher_or_admin),
):
    assert_can_write_outline(db, user, outline_id)
    db_outline = crud.update_outline(db=db, outline_id=outline_id, outline=outline)
    if not db_outline:
        raise HTTPException(status_code=404, detail="Outline not found")
    return db_outline

@router.delete("/{outline_id}")
def delete_outline(
    outline_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher_or_admin),
):
    assert_can_write_outline(db, user, outline_id)
    success = crud.delete_outline(db=db, outline_id=outline_id)
    if not success:
        raise HTTPException(status_code=444, detail="Outline not found")
    return {"message": "Outline deleted successfully"}

@router.post("/extract")
async def extract_outline(
    request: Request,
    name: str = Body(..., embed=True), 
    content: str = Body(..., embed=True), 
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher_or_admin),
):
    """创建大纲并启动 Agent 背景解析任务"""
    db_outline = crud.create_outline(
        db,
        schemas.OutlineCreate(name=name, desc="AI Generating..."),
        teacher_id=user.id,
    )
    outline_id = db_outline.id
    
    # 建立消息队列
    queue = agent_manager.get_queue(outline_id)
    
    # 启动后台任务运行 Agent，将各步状态推送到队列
    async def run_agent_task():
        try:
            async for event in run_outline_extraction_stream(content, outline_id=outline_id):
                await agent_manager.push_message(outline_id, event)
            # 任务彻底结束标识
            await agent_manager.push_message(outline_id, "[DONE]")
        except asyncio.CancelledError:
            raise
        except Exception as e:
            await agent_manager.push_message(outline_id, {"error": str(e)})

    task = asyncio.create_task(run_agent_task())
    agent_manager.set_task(outline_id, task)
    
    async def event_generator():
        stream = StreamRun(resource_ids={"outline_id": outline_id})
        try:
            while True:
                if await request.is_disconnected():
                    agent_manager.cancel_task(outline_id)
                    break

                # 非阻塞地等待队列中的消息
                try:
                    msg = await asyncio.wait_for(queue.get(), timeout=1)
                except asyncio.TimeoutError:
                    continue
                
                if msg == "[DONE]":
                    yield stream.done()
                    break
                
                if isinstance(msg, dict) and msg.get("error"):
                    yield stream.error(
                        msg["error"],
                        code="OUTLINE_EXTRACTION_FAILED",
                        details={"outline_id": outline_id},
                    )
                    break

                # 使用 jsonable_encoder 处理可能包含 Pydantic 模型的复杂对象
                clean_msg = jsonable_encoder(msg)
                if clean_msg.get("is_awaiting_review"):
                    yield stream.review_required(clean_msg)
                else:
                    yield stream.progress(clean_msg)
                
                # 记录队列处理完成
                queue.task_done()
        finally:
            # 清理
            agent_manager.clear_all(outline_id)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/{outline_id}/feedback")
async def send_agent_feedback(
    outline_id: int, 
    feedback: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher_or_admin),
):
    """【真格的续作】通过该接口提交用户审核，恢复 Agent 运行"""
    assert_can_write_outline(db, user, outline_id)
    agent_manager.set_feedback(outline_id, feedback)
    return {"message": "Feedback received, agent resumed"}


@router.post("/{outline_id}/cancel")
async def cancel_outline_extraction(
    outline_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher_or_admin),
):
    """取消正在运行或等待审核的 Outline Agent。"""
    assert_can_write_outline(db, user, outline_id)
    cancelled = agent_manager.cancel_task(outline_id)
    agent_manager.clear_all(outline_id)
    return {"message": "Cancellation requested", "cancelled": cancelled}
