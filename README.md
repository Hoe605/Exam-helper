# Exam-helper

智能教育题库与知识图谱系统，采用 **FastAPI + SQLAlchemy + LangGraph**（后端）和 **Next.js**（前端）。

## 目录结构

```text
.
├── src/                 # 后端业务代码（真实服务入口：src/services/main.py）
├── web/                 # 前端应用（Next.js）
├── scripts/             # 初始化与维护脚本
├── alembic/             # 数据库迁移
├── docs/                # 设计文档与接口规范
└── tests/               # Python 测试
```

## 开发环境准备

### 1) 后端（Python + uv）

```bash
cd <repo-root>
python -m pip install uv
~/.local/bin/uv sync
cp .env.example .env
```

`.env` 至少需要设置：

- `SECRET_KEY`
- `LLM_API_KEY`（仅在需要真实 LLM 调用时）

### 2) 前端（统一使用 pnpm）

```bash
cd web
corepack enable
pnpm install --frozen-lockfile
```

> 前端包管理器已统一为 **pnpm**，请勿再使用 npm lockfile。

## 启动方式

### 后端 API

推荐入口（等价）：

```bash
cd <repo-root>
~/.local/bin/uv run uvicorn src.services.main:app --reload
# 或
~/.local/bin/uv run python main.py
```

访问文档：`http://127.0.0.1:8000/docs`

### 前端

```bash
cd web
pnpm dev
```

## 数据库迁移

```bash
cd <repo-root>
~/.local/bin/uv run alembic revision --autogenerate -m "your_change_name"
~/.local/bin/uv run alembic upgrade head
```

## 测试与验证

### 后端测试

```bash
cd <repo-root>
SECRET_KEY=test-secret ~/.local/bin/uv run pytest
```

深度测试（会消耗 Token）：

```bash
cd <repo-root>
SECRET_KEY=test-secret LLM_API_KEY=xxx ~/.local/bin/uv run pytest --deep
```

### 前端质量检查

```bash
cd web
pnpm lint
pnpm build
```

## 安全说明

- `SECRET_KEY` 必须通过环境变量提供，不再允许不安全默认值。
- `scripts/create_superuser.py` 不再内置默认管理员账号密码，需显式传入：
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`

## API 变更流程

新增或修改 API 时，请遵循：

- `docs/api_specification.md`
- `docs/api_change_checklist.md`
