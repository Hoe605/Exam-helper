"""
共享测试夹具：创建独立的文件数据库并覆盖 FastAPI 依赖。
每个测试函数前清空所有业务表，确保测试间隔离。
"""
import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from src.db.base import Base
from src.db.session import get_db, get_async_db
from src.services.main import app

# ---------------------------------------------------------------------------
# 引擎（使用单独文件库，避免干扰开发库）
# ---------------------------------------------------------------------------
TEST_DATABASE_URL = "sqlite:///./test_api.db"
TEST_ASYNC_DATABASE_URL = "sqlite+aiosqlite:///./test_api.db"

sync_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

async_engine = create_async_engine(
    TEST_ASYNC_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
AsyncTestSessionLocal = async_sessionmaker(async_engine, expire_on_commit=False)


@pytest.fixture(scope="session", autouse=True)
def create_test_db():
    """整个测试会话只建/删一次表结构。"""
    import src.db.models  # noqa: F401 – 确保所有模型注册到 Base.metadata
    Base.metadata.create_all(bind=sync_engine)
    yield
    Base.metadata.drop_all(bind=sync_engine)


# 按依赖顺序列出所有业务表（子表在父表之前）
_TABLES_TO_TRUNCATE = [
    "user_node_mastery",
    "user_action_log",
    "question_node_mapping",
    "question_answer",
    "specification",
    "course_outline_mapping",
    "course_user_mapping",
    "course",
    "question",
    "question_staging",
    "node",
    "outline",
    "user",
]


@pytest.fixture(autouse=True)
def clean_db():
    """每个测试函数前清空所有业务表。"""
    with sync_engine.begin() as conn:
        for table in _TABLES_TO_TRUNCATE:
            conn.execute(text(f"DELETE FROM {table}"))
    yield


def _override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


def _override_get_async_db():
    async def _inner():
        async with AsyncTestSessionLocal() as session:
            yield session
    return _inner


@pytest.fixture()
def client():
    """返回一个使用隔离数据库的 TestClient。"""
    app.dependency_overrides[get_db] = _override_get_db
    app.dependency_overrides[get_async_db] = _override_get_async_db()
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
    app.dependency_overrides.clear()
