from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from src.db.session import get_db
from src.db.models import User
from src.core.auth.permissions import assert_can_write_outline, require_teacher_or_admin
from src.core.agent.question.extract.extract_agent import run_question_extraction_stream
from src.core.streaming import StreamRun

router = APIRouter(
    tags=["question-agent"]
)

@router.post("/extract")
async def extract_questions(
    content: str = Body(..., embed=True),
    outline_id: int = Body(..., embed=True),
    type: str = Body("其他", embed=True),
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher_or_admin),
):
    """
    启动题目提取 Agent，流式返回提取进度和状态。
    """
    assert_can_write_outline(db, user, outline_id)
    async def event_generator():
        stream = StreamRun(resource_ids={"outline_id": outline_id})
        try:
            # 这里的 run_question_extraction_stream 是一个异步生成器
            async for update in run_question_extraction_stream(content, outline_id, type):
                # 只返回前端需要的核心字段，并确保日期等对象被正确序列化
                msg = {
                    "step": update["step"],
                    "count": update["count"],
                    "total_chunks": update.get("total_chunks", 0),
                    "processed_chunks": update.get("processed_chunks", 0),
                    "db_response": update["db_response"],
                    "errors": update["errors"]
                }
                yield stream.progress(msg)
            
            yield stream.done()
        except Exception as e:
            yield stream.error(
                str(e),
                code="QUESTION_EXTRACTION_FAILED",
                details={"outline_id": outline_id, "type": type},
                step="error",
            )

    return StreamingResponse(event_generator(), media_type="text/event-stream")
