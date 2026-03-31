import logging
from typing import Dict, Any
from .extract.extract_agent import build_extract_agent

logger = logging.getLogger(__name__)

class QuestionAgent:
    """
    题库解析 Agent：已重构并逻辑迁移至 extract/ 文件夹。
    保留此类用于向后兼容，更多现代用法请参见 extract/extract_agent.py 中的流式入口。
    """

    def __init__(self):
        self._app = build_extract_agent()

    def run(self, content: str, outline_id: int) -> Dict[str, Any]:
        """
        启动解析流水线。
        :param content:     Markdown 原文
        :param outline_id:  归属大纲 ID
        :return: 包含 count / db_response / outline_id 的摘要
        """
        # 调用重构后的 LangGraph 实例
        final = self._app.invoke({
            "document_content": content,
            "outline_id": int(outline_id),
            "question_chunks": [],
            "current_batch_results": [],
            "db_response": "",
            "errors": []
        })
        
        return {
            "success": True,
            "count": len(final.get("current_batch_results", [])),
            "db_response": final.get("db_response", ""),
            "outline_id": outline_id,
        }

