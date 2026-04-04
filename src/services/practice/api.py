from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from src.db.session import get_db
from src.core.agent.question.generate.graph import build_generate_agent
from .utils import normalize_node_to_md
import json
import asyncio

router = APIRouter(
    prefix="/practice",
    tags=["practice"]
)

# 实例化生成 Agent 单例
generate_agent = build_generate_agent()

@router.get("/generate-stream")
async def generate_practice_stream(
    node_id: int = Query(..., description="知识点 ID"),
    db: Session = Depends(get_db)
):
    """
    通过智能题目生成 Agent 进行流式生成题目
    支持结构化 XML-like 标签包裹输出
    """
    # 1. 准备知识文档
    node_md = normalize_node_to_md(db, node_id)
    if "未找到" in node_md:
         raise HTTPException(status_code=404, detail="Node not found")
         
    # 2. 准备初始化状态
    initial_state = {
        "node_id": node_id,
        "node_md": node_md,
        "generated_content": "",
        "errors": []
    }
    
    # 3. 流式生成事件发生器
    async def event_generator():
        try:
            # 使用 LangGraph 的 astream_events 方法，捕获 LLM 的实时 chunk
            async for event in generate_agent.astream_events(
                initial_state,
                version="v2"
            ):
                # 只有在 generate 节点运行且事件是 on_chat_model_stream 时，我们才产出内容
                if (
                    event["event"] == "on_chat_model_stream" and 
                    event["metadata"].get("langgraph_node") == "generate"
                ):
                    chunk = event["data"]["chunk"]
                    if chunk.content:
                        yield chunk.content
        except Exception as e:
            yield f"\n[ERROR]: {str(e)}"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")
