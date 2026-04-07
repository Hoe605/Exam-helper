import socket
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.services.outline.api import router as outline_router
from src.services.outline.node.api import router as node_router
from src.services.question.api import router as question_router
from src.services.practice.api import router as practice_router
from src.services.course.api import router as course_router

def get_local_ip():
    """获取本机在局域网中的 IP 地址"""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # 不需要真的建立连接
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时执行
    local_ip = get_local_ip()
    port = 8000 # 默认为 8000
    
    # 打印精美的启动提示信息
    print("\n" + "="*50)
    print("🚀 ExamHelper API Service 正在运行:")
    print(f"   - Local:    http://127.0.0.1:{port}")
    print(f"   - Network:  http://{local_ip}:{port}")
    print("="*50 + "\n")
    
    yield
    # 关闭时执行 (如有需要)

app = FastAPI(
    title="ExamHelper API Services",
    description="Unified API backend for ExamHelper system.",
    version="0.1.0",
    lifespan=lifespan
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册各个模块的路由
app.include_router(outline_router)
app.include_router(node_router)
app.include_router(question_router)
app.include_router(practice_router)
app.include_router(course_router)

from src.core.auth.fastapi_users import fastapi_users
from src.core.auth.jwt import auth_backend

# 认证路由 (仅开放登录入口，不开放注册)
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)

from src.core.auth.schemas import UserRead, UserUpdate
from src.services.admin.api import router as admin_router

# 用户管理路由 (支持 /me 获取当前登录用户信息)
# 注册 admin 路由以支持 GET /users
app.include_router(admin_router)

app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

@app.get("/")
def root():
    return {"message": "Welcome to ExamHelper API Service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
