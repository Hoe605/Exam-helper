import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# 数据库连接地址，优先从环境变量读取。默认使用 SQLite 供开发测试
# 如果后期需要换成 PostgreSQL（推荐 PGVector），可以修改 .env 中的 DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./exam_helper.db")

# 初始化 SQLAlchemy 引擎
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
