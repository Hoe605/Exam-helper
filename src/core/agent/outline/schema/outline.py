from __future__ import annotations # 支持递归类型声明
from pydantic import BaseModel, Field, ConfigDict, model_validator
from typing import List, Optional

class OutlineNode(BaseModel):
    """
    具体的考纲知识点节点 (支持递归嵌套提取)
    """
    model_config = ConfigDict(extra='ignore') 
    
    name: str = Field(description="知识点名称")
    description: Optional[str] = Field(None, description="内容描述或要求")
    parent_name: Optional[str] = Field(None, description="[系统内部使用] 父节点名称")
    level: int = Field(1, description="[系统内部使用] 节点层级 (1: 章, 2: 节, 3: 点等)")
    children: Optional[List["OutlineNode"]] = Field(default_factory=list, description="子知识点列表")
    
    @model_validator(mode='before')
    @classmethod
    def set_children_default(cls, data: dict):
        if data.get("children") is None:
            data["children"] = []
        return data

# 必须更新模型引用
OutlineNode.model_rebuild()
