# Exam-helper

智能教育题库与知识图谱系统，基于大语言模型（LLM）和多智能体（Multi-Agent）架构。

## 技术栈

*   **包管理**: [uv](https://github.com/astral-sh/uv)
*   **编排框架**: [LangGraph](https://github.com/langchain-ai/langgraph)
*   **LLM 接口**: LangChain (OpenAI Adapter)
*   **数据库**: SQLAlchemy 2.0 (默认使用 SQLite)
*   **配置管理**: Pydantic Settings
*   **测试框架**: Pytest

## 快速开发指引

### 1. 环境准备
推荐使用 `uv` 进行现代化的依赖管理：
```bash
# 同步环境并安装依赖
uv sync
```

### 2. 配置环境变量
在项目根目录下，根据 `.env.example` 创建 `.env` 文件，并填写相关配置：
```env
# LLM 配置
LLM_API_KEY=your_api_key_here
LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
LLM_MODEL=glm-4-flash

# 数据库配置 (可选)
DB_TYPE=sqlite
DB_NAME=exam_helper.db
```

### 3. 初始化数据库
在开始开发或测试前，请先初始化本地数据库表结构：
```bash
uv run init-db
```
*注：该命令会自动执行 `scripts/init_db.py`，并在根目录生成 `exam_helper.db`（如果使用默认配置）。*

### 4. 运行测试
项目采用 `pytest` 进行分层测试：

#### A. 基础单元测试 (Mocked)
这部分测试使用模拟环境，不消耗 Token，验证代码逻辑是否正确。
```bash
uv run pytest
```

#### B. 深度集成测试 (可能消耗 Token)
包含 `@pytest.mark.deep` 标记的测试，会真实发起 LLM 调用（如配置了 KEY）。
```bash
# 运行全部测试（包括深度测试）
uv run pytest --deep

# 查看详细响应输出
uv run pytest --deep -s
```

## 项目结构

```text
├── scripts/             # 维护与初始化脚本
│   └── init_db.py      # 数据库初始化入口
├── src/
│   ├── config/          # 中心化配置管理 (Pydantic Settings)
│   ├── core/            # 核心业务逻辑 (Agent, LLM Factory)
│   └── db/              # 数据库模型与会话管理
│       ├── models.py    # SQLAlchemy 模型定义
│       └── session.py   # 数据库连接与 Session 创建
├── tests/               # 项目测试套件
├── docs/                # 项目文档，包含 design.md
├── .env                 # 本地环境变量 (不加入 Git)
├── main.py              # 项目主入口
└── pyproject.toml       # 项目依赖与元数据配置
```

## 核心模块说明
*   `src/config/settings.py`: 统一读取环境变量，提供类型安全的配置访问。
*   `src/db/models.py`: 包含知识图谱核心表（Outline, Node）、题目缓冲区及用户解析等模型。
*   `src/core/llm.py`: LLM 对象实例化工厂。