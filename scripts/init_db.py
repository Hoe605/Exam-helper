import os
import sys
sys.path.append(os.getcwd())

from src.db.session import engine
from src.db.models import Base

def init_db():
    print("🧹 正在清理并重新创建数据库表...")
    # 注意：这会删除所有现有数据，仅用于开发环境
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ 数据库表已重新创建。")

if __name__ == "__main__":
    init_db()
