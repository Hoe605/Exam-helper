from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from src.core.auth.fastapi_users import get_current_active_user
from src.core.auth.schemas import UserRead, UserCreate
from src.core.auth.manager import get_user_manager, UserManager
from src.db.session import get_async_db
from src.db.models import User

router = APIRouter(prefix="/users", tags=["admin-users"])

@router.get("", response_model=List[UserRead])
async def list_users(
    db: AsyncSession = Depends(get_async_db),
    admin: User = Depends(get_current_active_user)
):
    if not admin.is_superuser:
        raise HTTPException(status_code=403, detail="Only superusers can list users")
    
    result = await db.execute(select(User))
    return result.scalars().all()

@router.post("", response_model=UserRead)
async def admin_create_user(
    user_create: UserCreate,
    user_manager: UserManager = Depends(get_user_manager),
    admin: User = Depends(get_current_active_user)
):
    if not admin.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # safe=False allows us to create active/superuser users directly if specified
    return await user_manager.create(user_create, safe=False)
