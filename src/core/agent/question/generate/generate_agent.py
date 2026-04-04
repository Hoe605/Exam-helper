import logging
from sqlalchemy.orm import Session
from .graph import build_generate_agent
from .util.node import normalize_node_to_md

logger = logging.getLogger(__name__)

class GenerateAgentSDK:
    """
    题目练习生成 Agent SDK
    封装了数据准备、状态初始化以及流式调用的逻辑。
    """
    
    def __init__(self):
        # 预编译 LangGraph 应用
        self._app = build_generate_agent()

    async def run_generate_practice_stream(self, db: Session, node_id: int, difficulty: str = "中等", q_type: str = "单选题"):
        """
        SDK 流式生成入口：
        1. 负责将 DB 节点转化为 LLM 可读的 Markdown。
        2. 负责初始化 Agent 运行状态。
        3. 负责解析并产生流式事件。
        
        Args:
            db: Session
            node_id: int
            difficulty: str (简单, 中等, 困难)
            q_type: str (单选题, 多选题, 填空题, 解答题)
            
        Yields:
            str: 生成的内容字串块。
        """
        # 1. 数据对齐与准备 (SDK 负责屏蔽 DB 细节)
        node_md = normalize_node_to_md(db, node_id)
        if not node_md:
            logger.error(f"Node {node_id} not found when generating question.")
            yield f"[ERROR]: 未找到该知识点 (Node ID: {node_id})"
            return

        # 2. 初始化初始状态
        initial_state = {
            "node_id": node_id,
            "node_md": node_md,
            "q_type": q_type,
            "difficulty": difficulty,
            "generated_content": "",
            "errors": []
        }
        
        # 3. 执行流式逻辑
        try:
            async for event in self._app.astream_events(
                initial_state,
                version="v2"
            ):
                # 只输出 generate 节点相关的 LLM 过程
                if (
                    event["event"] == "on_chat_model_stream" and 
                    event["metadata"].get("langgraph_node") == "generate"
                ):
                    chunk = event["data"]["chunk"]
                    if chunk.content:
                        yield chunk.content
        except Exception as e:
            logger.exception("Error during agent generation stream.")
            yield f"\n[ERROR]: Agent 运行异常: {str(e)}"
