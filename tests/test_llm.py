import os
import pytest
from unittest.mock import MagicMock
from langchain_openai import ChatOpenAI
from core.llm import get_llm

def test_get_llm_instantiation(monkeypatch):
    """
    测试获取模型实例。
    我们将模拟环境变量以测试不同参数的优先级。
    """
    # 模拟环境变量
    monkeypatch.setenv("LLM_API_KEY", "test_key")
    monkeypatch.setenv("LLM_MODEL", "test_model")
    monkeypatch.setenv("LLM_BASE_URL", "https://test.api.com/v1")

    # 1. 默认逻辑 (环境变量提取)
    model = get_llm()
    assert isinstance(model, ChatOpenAI)
    assert model.openai_api_key.get_secret_value() == "test_key"
    assert model.model_name == "test_model"
    assert model.openai_api_base == "https://test.api.com/v1"

    # 2. 参数传给 get_llm
    overridden_model = get_llm(model_name="overridden_model")
    assert overridden_model.model_name == "overridden_model"

def test_get_llm_missing_key(monkeypatch):
    """
    测试当 API Key 完全缺失时是否报错。
    """
    monkeypatch.delenv("LLM_API_KEY", raising=False)
    
    with pytest.raises(ValueError, match="请在 .env 文件中配置 LLM_API_KEY"):
        get_llm(api_key=None)

def test_get_llm_streaming():
    """
    测试是否默认支持 streaming 并正确透传额外的 kwargs。
    """
    # 手动传一个 api_key，不依赖环境
    model = get_llm(api_key="manual_key", temperature=0.7, max_tokens=100)
    assert model.temperature == 0.7
    assert model.streaming is True
    assert model.max_tokens == 100

@pytest.mark.deep
def test_llm_response():
    """
    真正的深度测试：尝试调用 LLM 并接收响应。
    只有在 pytest --deep 命令下才运行。
    """
    model = get_llm()
    # 简单的打个招呼测试
    try:
        response = model.invoke("你好，请用两个字回复：你好")
        assert response is not None
        assert "你好" in response.content
        print(f"\nLLM 响应测试成功: {response.content}")
    except Exception as e:
        pytest.fail(f"LLM 真实响应测试失败: {e}")

