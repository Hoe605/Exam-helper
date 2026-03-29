# Exam-helper

智能教育题库与知识图谱系统，基于大语言模型（LLM）和多智能体（Multi-Agent）架构。

## 技术栈

*   **包管理**: [uv](https://github.com/astral-sh/uv)
*   **编排框架**: [LangGraph](https://github.com/langchain-ai/langgraph)
*   **LLM 接口**: LangChain
*   **测试框架**: Pytest

## 快速开发指引

### 1. 环境准备
使用 `uv` 进行依赖管理：
```bash
# 安装依赖
uv pip install -e .
```

### 2. 配置环境变量
在项目根目录下，根据 `.env.example` 创建 `.env` 文件，并填写相关配置：
```bash
# 核心配置
LLM_API_KEY=your_api_key_here
LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
LLM_MODEL=glm-4-flash
```
*注：也支持引用系统中已有的环境变量（例如：`LLM_API_KEY=${GLM_API_KEY}`）。*

### 3. 本地测试流程

项目采用 `pytest` 进行分层测试：

#### A. 基础单元测试 (Mocked)
这部分测试使用模拟环境，不消耗 Token，验证代码逻辑是否正确。
```bash
uv run pytest
```

#### B. 深度集成测试 (消耗真 Token)
包含 `@pytest.mark.deep` 标记的测试，会真实发起 LLM 调用，验证模型对接效果。
```bash
# 运行全部测试（包括深度测试）
uv run pytest --deep

# 查看详细响应输出
uv run pytest --deep -s
```

## 项目结构
*   `src/core/llm.py`: LLM 对象实例化工厂。
*   `tests/`: 项目测试套件，包含 `conftest.py` 全局配置。
*   `design.md`: 系统详细设计文档。