import sys
import os

# 将 src 目录添加到 Python 路径中，以便能够正确导入模型和配置
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.db.base import Base
from src.db import models # 导入所有模型以确保它们注册到 Base.metadata
from src.db.session import engine, DATABASE_URL

def init_db():
    """初始化数据库，创建所有表"""
    print(f"正在尝试连接并初始化数据库: {DATABASE_URL}")
    try:
        # 在数据库中创建所有已定义的表
        Base.metadata.create_all(bind=engine)
        print("✅ 数据库表初始化完成！")
    except Exception as e:
        print(f"❌ 初始化数据库报错: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_db()
