import logging
from typing import Dict, Any
from .graph import build_classify_agent
from .state import ClassifyState

logger = logging.getLogger(__name__)

class QuestionClassifySDK:
    """
    题目分类 Agent SDK
    封装了根据题目 ID 进行自动归类到章节 (Level 2) 的全部逻辑。
    """
    
    def __init__(self):
        # 预编译 LangGraph 应用
        self._app = build_classify_agent()

    async def classify_question(self, q_id: int) -> Dict[str, Any]:
        """
        SDK 调用入口：
        1. 负责获取题目所属大纲并提取章节列表。
        2. 负责调用 LLM 进行语义理解与分类对齐。
        3. 负责在数据库 question_node_mapper 中持久化关联结果。
        
        Args:
            q_id: 正式题库中的题目 ID。
            
        Returns:
            Dict: 包含执行结果摘要（selected_node, db_status 等）。
        """
        initial_state = {
            "q_id": q_id,
            "outline_id": None,
            "question_content": "",
            "candidate_nodes": [],
            "selected_node_id": None,
            "selected_node_name": None,
            "db_status": "Starting",
            "errors": []
        }
        
        try:
            # 运行 LangGraph 工作流
            final_state = await self._app.ainvoke(initial_state)
            
            # 检查处理过程中的错误
            if final_state.get("errors"):
                 return {
                    "success": False,
                    "errors": final_state["errors"]
                }
            
            return {
                "success": True,
                "q_id": q_id,
                "selected_node_id": final_state.get("selected_node_id"),
                "selected_node_name": final_state.get("selected_node_name"),
                "db_status": final_state.get("db_status")
            }
            
        except Exception as e:
            logger.exception(f"QuestionClassifySDK failed for q_id={q_id}")
            return {
                "success": False,
                "errors": [f"Runtime execution error: {str(e)}"]
            }
