import os
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

from src.config.settings import settings

# 从配置中获取数据库连接地址
DATABASE_URL = settings.sqlalchemy_database_url

# 初始化 SQLAlchemy 引擎 (同步)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 初始化 SQLAlchemy 引擎 (异步 - 专项供 Auth 使用)
ASYNC_DATABASE_URL = DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///")
async_engine = create_async_engine(ASYNC_DATABASE_URL, connect_args=connect_args)
AsyncSessionLocal = async_sessionmaker(async_engine, expire_on_commit=False)

def get_db():
    """获取数据库 Session 的生成器 (同步)"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_db():
    """获取数据库 AsyncSession 的生成器 (异步)"""
    async with AsyncSessionLocal() as db:
        yield db
