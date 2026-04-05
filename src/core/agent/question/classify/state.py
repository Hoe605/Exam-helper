from typing import TypedDict, List, Optional, Dict, Any

class ClassifyState(TypedDict):
    """
    题目分类 Agent 状态定义
    """
    q_id: int
    outline_id: Optional[int]
    
    # 题目文本内容
    question_content: str
    
    # 候选章节节点列表 (Level 2)
    candidate_nodes: List[Dict[str, Any]] # [{"id": 1, "name": "章节1", "desc": "..."}]
    
    # 分类结果
    selected_node_id: Optional[int]
    selected_node_name: Optional[str]
    
    # 处理结果/错误
    db_status: str
    errors: List[str]
