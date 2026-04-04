from __future__ import annotations # 支持递归类型声明
from pydantic import BaseModel, Field, ConfigDict, model_validator
from typing import List, Optional


class ExtractionNode(BaseModel):
    """
    专门给 LLM 填写的解析节点结构，去除了内部字段以提升解析准确度。
    """
    model_config = ConfigDict(extra='ignore')
    
    name: str = Field(description="知识点名称, 如：'第一章 函数与极限' 或 '一、函数的性质'")
    description: Optional[str] = Field(None, description="详细的内容描述、考核点要求或公式等。")
    children: Optional[List[dict]] = Field(None, description="子知识点列表")

ExtractionNode.model_rebuild()