from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from src.core.auth.fastapi_users import get_current_active_user
from src.core.auth.schemas import UserRead, UserCreate, UserUpdate
from src.core.auth.manager import get_user_manager, UserManager
from src.db.session import get_async_db
from src.db.models import User

router = APIRouter(prefix="/admin/users", tags=["admin-users"])

@router.get("", response_model=List[UserRead])
async def list_users(
    db: AsyncSession = Depends(get_async_db),
    admin: User = Depends(get_current_active_user)
):
    if not admin.is_superuser and admin.role != "admin":
        raise HTTPException(status_code=403, detail="Only superusers or admins can list users")
    
    if admin.is_superuser:
        result = await db.execute(select(User))
    else:
        result = await db.execute(select(User).where(User.is_superuser == False))
    return result.scalars().all()

@router.post("", response_model=UserRead)
async def admin_create_user(
    user_create: UserCreate,
    user_manager: UserManager = Depends(get_user_manager),
    admin: User = Depends(get_current_active_user)
):
    if not admin.is_superuser and admin.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # safe=False allows us to create active/superuser users directly if specified
    return await user_manager.create(user_create, safe=False)

@router.patch("/{id}", response_model=UserRead)
async def admin_update_user(
    id: int,
    user_update: UserUpdate,
    user_manager: UserManager = Depends(get_user_manager),
    admin: User = Depends(get_current_active_user)
):
    if not admin.is_superuser and admin.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    user = await user_manager.get(id)
    if not admin.is_superuser and user.is_superuser:
        raise HTTPException(status_code=403, detail="Cannot modify superuser")
        
    return await user_manager.update(user_update, user, safe=False)

@router.delete("/{id}", status_code=204)
async def admin_delete_user(
    id: int,
    user_manager: UserManager = Depends(get_user_manager),
    admin: User = Depends(get_current_active_user)
):
    if not admin.is_superuser and admin.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    user = await user_manager.get(id)
    if not admin.is_superuser and user.is_superuser:
        raise HTTPException(status_code=403, detail="Cannot delete superuser")
        
    await user_manager.delete(user)
    return None
