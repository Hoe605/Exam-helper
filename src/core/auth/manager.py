from typing import Optional, Any
from fastapi import Request, Depends
from fastapi_users import BaseUserManager, IntegerIDMixin, exceptions, models
from src.db.models import User
from .db import get_user_db
from src.config.settings import settings

SECRET = settings.secret_key

class UserManager(IntegerIDMixin, BaseUserManager[User, int]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} has registered.")

    async def authenticate(self, credentials: ...) -> Optional[User]:
        """
        覆盖认证逻辑，支持使用邮箱或用户名登录。
        """
        user = None
        try:
            # 尝试通过邮箱获取用户
            user = await self.get_by_email(credentials.username)
        except exceptions.UserNotExists:
            # 如果邮箱不存在，尝试通过用户名获取
            user = await self.user_db.get_by_username(credentials.username)
        
        if user is None or not user.is_active:
            return None

        # 校验密码
        verified, updated_password = self.password_helper.verify_and_update(
            credentials.password, user.hashed_password
        )
        if not verified:
            return None
            
        return user

async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)
