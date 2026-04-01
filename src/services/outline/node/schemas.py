from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class NodeBase(BaseModel):
    name: str
    desc: Optional[str] = None
    level: int
    status: Optional[int] = 1
    outline_id: int
    f_node: Optional[int] = None

class NodeCreate(NodeBase):
    pass

class NodeUpdate(BaseModel):
    name: Optional[str] = None
    desc: Optional[str] = None
    level: Optional[int] = None
    status: Optional[int] = None

class Node(NodeBase):
    id: int
    # Allow recursive structure
    children: List['Node'] = []
    
    model_config = ConfigDict(from_attributes=True)
