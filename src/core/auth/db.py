from fastapi import Depends
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.session import get_async_db
from src.db.models import User

async def get_user_db(db: AsyncSession = Depends(get_async_db)):
    yield SQLAlchemyUserDatabase(db, User)
