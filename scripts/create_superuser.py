import os
from src.db.session import SessionLocal
from src.db.models import User
from pwdlib import PasswordHash

# 使用 fastapi-users 默认的密码哈希算法 (通常是 argon2 或 bcrypt)
password_helper = PasswordHash.recommended()

def create_first_superuser():
    """使用同步 SQLAlchemy 插入第一个超级管理员账号"""
    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    username = os.getenv("ADMIN_USERNAME", "admin")
    role = os.getenv("ADMIN_ROLE", "admin")

    if not email or not password:
        raise ValueError("请先设置 ADMIN_EMAIL 和 ADMIN_PASSWORD 环境变量后再执行创建管理员脚本。")

    hashed_password = password_helper.hash(password)

    print(f"\n[INIT] 准备创建初始管理员账号: {email} ...")
    
    with SessionLocal() as db:
        # 检查是否已存在
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"[SKIP] 用户 {email} 已存在，跳过。")
            return
            
        # 手动构造用户对象并插入
        new_user = User(
            email=email,
            username=username,
            hashed_password=hashed_password,
            role=role,
            is_active=True,
            is_superuser=True,
            is_verified=True
        )
        db.add(new_user)
        db.commit()
        print(f"[SUCCESS] 管理员账号创建成功！")
        print(f"         - Email: {email}")
        print(f"         - Username: {username}")
        print(f"         - Role:  {role}")

if __name__ == "__main__":
    create_first_superuser()
