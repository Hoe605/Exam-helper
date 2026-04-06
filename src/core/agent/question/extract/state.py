from typing import List, TypedDict, Dict, Any, Optional

class ExtractState(TypedDict):
    document_content: str               # 原始输入文档
    outline_id: int                     # 归属大纲 ID
    raw_chunks: List[str]               # slicer 切分后的原始片段
    pending_chunks: List[str]           # 待处理队列
    processed_count: int                # 已处理切片数
    total_count: int                    # 总切片数
    current_batch_results: List[dict]   # 当前单次节点提取出的题目列表
    extracted_questions: List[dict]     # 累计提取出的所有题目
    question_type: str                  # 题目来源/分类 (如: 真题, 模拟题)
    db_stats: Dict[str, Any]            # 累计入库统计结果
    errors: List[str]
