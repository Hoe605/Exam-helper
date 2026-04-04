from typing import TypedDict, Optional, List

class GenerateState(TypedDict):
    """
    题目生成 Agent 状态定义
    """
    node_id: int
    node_md: str
    
    # 生成后的完整文本（流式输出也会最后存在这里）
    generated_content: Optional[str]
    
    # 题目类型偏好 (单选题, 多选题, 填空题, 解答题)
    q_type: Optional[str]
    
    # 难度设置 (简单, 中等, 困难)
    difficulty: Optional[str]
    
    # 错误记录
    errors: List[str]
