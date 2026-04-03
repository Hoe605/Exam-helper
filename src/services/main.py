from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.services.outline.api import router as outline_router
from src.services.outline.node.api import router as node_router
from src.services.question.api import router as question_router

app = FastAPI(
    title="ExamHelper API Services",
    description="Unified API backend for ExamHelper system.",
    version="0.1.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发阶段允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册各个模块的路由
app.include_router(outline_router)
app.include_router(node_router)
app.include_router(question_router)

@app.get("/")
def root():
    return {"message": "Welcome to ExamHelper API Service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
