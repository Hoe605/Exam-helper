from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from src.db.session import get_db
from src.core.agent.question.extract.extract_agent import run_question_extraction_stream
import json
import asyncio
from fastapi.encoders import jsonable_encoder

router = APIRouter(
    tags=["question-agent"]
)

@router.post("/extract")
async def extract_questions(
    content: str = Body(..., embed=True),
    outline_id: int = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """
    启动题目提取 Agent，流式返回提取进度和状态。
    """
    async def event_generator():
        try:
            # 这里的 run_question_extraction_stream 是一个异步生成器
            async for update in run_question_extraction_stream(content, outline_id):
                # 只返回前端需要的核心字段，并确保日期等对象被正确序列化
                msg = {
                    "step": update["step"],
                    "count": update["count"],
                    "db_response": update["db_response"],
                    "errors": update["errors"]
                }
                yield f"data: {json.dumps(jsonable_encoder(msg), ensure_ascii=False)}\n\n"
            
            yield "data: [DONE]\n\n"
        except Exception as e:
            error_msg = {"error": str(e), "step": "error"}
            yield f"data: {json.dumps(error_msg, ensure_ascii=False)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
