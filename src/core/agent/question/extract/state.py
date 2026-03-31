from typing import List, TypedDict, Dict, Any

class ExtractState(TypedDict):
    document_content: str
    outline_id: int
    question_chunks: List[str]
    current_batch_results: List[dict]
    db_response: str
    errors: List[str]
