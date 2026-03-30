import re
from typing import Optional

def _find_anchor_idx(full_text: str, anchor: str, start_pos: int = 0) -> int:
    """内部函数：融合精确匹配与正则模糊(忽略空格换行)匹配寻找索引"""
    if not anchor: return -1
    # 1. 尝试精确寻找
    idx = full_text.find(anchor, start_pos)
    if idx != -1: return idx
    
    # 2. 尝试正则模糊寻找 (允许中间有任意空白字符或换行)
    # 我们将 anchor 中不连续的可打印片段拿出来进行拼装
    safe_parts = [re.escape(p) for p in re.split(r'\s+', anchor) if p]
    if not safe_parts: return -1
    
    # 灵活正则：在每个片段中间允许有 0 或多个空白符
    flexible_pattern = r'\s*'.join(safe_parts)
    
    match = re.search(flexible_pattern, full_text[start_pos:])
    if match:
        return start_pos + match.start()
    return -1

def slice_text_by_anchors(full_text: str, start_anchor: str, end_anchor: Optional[str] = None) -> str:
    """
    根据给定的起始和结束锚点，从全文中切分出目标片段。
    """
    # 1. 寻找起始位置 (精确 + 模糊双保险)
    start_idx = _find_anchor_idx(full_text, start_anchor, 0) if start_anchor else 0
    if start_idx == -1:
        print(f"⚠️ [模糊容错]: 无法精准定位起始锚点片段，退回至全文开头。")
        start_idx = 0
        
    # 2. 寻找结束位置
    if not end_anchor or end_anchor.lower() in ["the end", "none", ""]:
        end_idx = len(full_text)
    else:
        end_idx = _find_anchor_idx(full_text, end_anchor, start_idx)
        if end_idx == -1:
            print(f"⚠️ [模糊容错]: 无法精准定位结束片段，将截断至全文末尾。")
            end_idx = len(full_text)
            
    return full_text[start_idx:end_idx].strip()
