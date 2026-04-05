from fastapi import Depends
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.db.session import get_async_db
from src.db.models import User
from typing import Optional

class UserDatabase(SQLAlchemyUserDatabase[User, int]):
    async def get_by_username(self, username: str) -> Optional[User]:
        statement = select(self.user_table).where(self.user_table.username == username)
        result = await self.session.execute(statement)
        return result.scalars().first()

async def get_user_db(db: AsyncSession = Depends(get_async_db)):
    yield UserDatabase(db, User)
