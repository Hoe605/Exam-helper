from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from src.db.session import get_db
from src.core.agent.question.generate.generate_agent import GenerateAgentSDK

router = APIRouter(
    prefix="/practice",
    tags=["practice"]
)

# 实例化生成 Agent SDK 单例
generate_sdk = GenerateAgentSDK()

@router.get("/generate-stream")
async def generate_practice_stream(
    node_id: int = Query(..., description="知识点 ID"),
    difficulty: str = Query("中等", description="难度 (简单, 中等, 困难)"),
    q_type: str = Query("单选题", description="题目类型 (单选题, 多选题, 填空题, 解答题)"),
    db: Session = Depends(get_db)
):
    """
    通过智能题目生成 Agent SDK 进行流式生成题目
    """
    # 逻辑现已被封装在 SDK 中：
    # 1. 负责数据归一化
    # 2. 负责初始状态构建
    # 3. 负责流流分段产生
    
    return StreamingResponse(
        generate_sdk.run_generate_practice_stream(db, node_id, difficulty, q_type), 
        media_type="text/event-stream"
    )
