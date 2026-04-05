from typing import Optional
from fastapi_users import schemas
from pydantic import ConfigDict

class UserRead(schemas.BaseUser[int]):
    role: str
    model_config = ConfigDict(from_attributes=True)

class UserCreate(schemas.BaseUserCreate):
    role: Optional[str] = "student"

class UserUpdate(schemas.BaseUserUpdate):
    role: Optional[str] = None
