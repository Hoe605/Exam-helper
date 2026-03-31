from typing import List, Optional, TypedDict, Dict
from src.core.agent.outline.schema.outline import OutlineNode

class OutlineState(TypedDict):
    document_content: str
    edu_objective: str                  
    knowledge_domain: str
    global_background_content: Optional[str] 
    task_list: List[dict]               
    task_status: Dict[int, str]
    all_extracted_nodes: List[OutlineNode] # 已提取的任务根节点列表（树形）
    errors: List[str]                   
    outline_id: int                     
    user_feedback: Optional[str] # 用户对计划的反馈意见
    is_plan_approved: bool      # 计划是否已通过审核
