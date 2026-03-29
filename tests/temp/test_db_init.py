import os
import sys

# 把 src 加入路径
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

from db.base import Base
from db.session import engine
from db.models import *  # 确保所有模型都被注册到 Base 的 metadata 中

def init_db():
    print("=== 开始初始化数据库表 ===")
    try:
        # 创建所有继承自 Base 的表
        Base.metadata.create_all(bind=engine)
        print("所有表创建成功！请查看项目根目录下是否生成了 exam_helper.db 文件。")
    except Exception as e:
        print(f"数据库初始化失败: {e}")

if __name__ == "__main__":
    init_db()
