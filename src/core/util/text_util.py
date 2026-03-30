import re
from typing import Optional

def slice_text_by_anchors(full_text: str, start_anchor: str, end_anchor: Optional[str] = None) -> str:
    """
    根据给定的起始和结束锚点，从全文中切分出目标片段。
    
    Args:
        full_text: 原始考纲全文内容
        start_anchor: 起始锚点字符串
        end_anchor: 结束锚点字符串 (如果为 None 或 'The End' 则截取到末尾)
        
    Returns:
        sliced_content: 截取后的文本段落。
    """
    # 1. 寻找起始位置
    start_idx = full_text.find(start_anchor) if start_anchor else 0
    if start_idx == -1:
        # 如果找不到明确的锚点，尝试模糊匹配或默认从头开始
        print(f"⚠️ 警告: 未能找到起始锚点 '{start_anchor}'，将从全文开头开始。")
        start_idx = 0
        
    # 2. 寻找结束位置
    if not end_anchor or end_anchor.lower() in ["the end", "none", ""]:
        end_idx = len(full_text)
    else:
        end_idx = full_text.find(end_anchor, start_idx)
        if end_idx == -1:
            print(f"⚠️ 警告: 未能找到结束锚点 '{end_anchor}'，将截取到全文末尾。")
            end_idx = len(full_text)
            
    return full_text[start_idx:end_idx].strip()
