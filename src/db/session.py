import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

from src.config import settings

# 从配置中获取数据库连接地址
DATABASE_URL = settings.sqlalchemy_database_url

# 初始化 SQLAlchemy 引擎
# 如果是 SQLite，需要 check_same_thread 为 False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

# 创建线程安全的 Session 工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """获取数据库 Session 的生成器，便于在依赖注入中使用"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
