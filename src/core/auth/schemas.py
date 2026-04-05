from typing import Optional
from fastapi_users import schemas
from pydantic import ConfigDict

class UserRead(schemas.BaseUser[int]):
    username: Optional[str] = None
    role: str
    model_config = ConfigDict(from_attributes=True)

class UserCreate(schemas.BaseUserCreate):
    username: Optional[str] = None
    role: Optional[str] = "student"

class UserUpdate(schemas.BaseUserUpdate):
    username: Optional[str] = None
    role: Optional[str] = None
