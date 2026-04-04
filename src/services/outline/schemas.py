from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Dict, Any, List

class OutlineBase(BaseModel):
    name: str 
    desc: Optional[str] = None
    content: Optional[str] = None
    status: str = "Draft"
    # Use Field to map: API uses 'metadata', but DB uses 'metadata_'
    metadata: Optional[Dict[str, Any]] = Field(None, alias="metadata_")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class OutlineCreate(OutlineBase):
    pass

class OutlineUpdate(BaseModel):
    name: Optional[str] = None
    desc: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(None, alias="metadata_")
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class Outline(OutlineBase):
    id: int
    node_count: int = 0
