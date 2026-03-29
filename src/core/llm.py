import os
import logging
from typing import Optional
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.language_models import BaseChatModel

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 加载环境变量
load_dotenv()

def get_llm(
    model_name: Optional[str] = None,
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,
    temperature: float = 0,
    **kwargs
) -> BaseChatModel:
    """
    实例化并返回 LLM 模型对象。
    优先级：参数传入 > 环境变量 > 默认值。
    
    Args:
        model_name: 模型名称 (默认环境变量 LLM_MODEL 或 gpt-4o-mini)
        api_key: API Key (默认环境变量 LLM_API_KEY)
        base_url: API 基准地址 (默认环境变量 LLM_BASE_URL)
        temperature: 温度 (默认 0)
        **kwargs: 传递给 ChatOpenAI 的额外参数
        
    Returns:
        BaseChatModel: 已初始化的聊天模型。
        
    Raises:
        ValueError: 如果 API Key 缺失。
    """
    api_key = api_key or os.getenv("LLM_API_KEY")
    base_url = base_url or os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
    model = model_name or os.getenv("LLM_MODEL", "gpt-4o-mini")

    if not api_key:
        logger.error("LLM_API_KEY 未配置，无法实例化模型。")
        raise ValueError("请在 .env 文件中配置 LLM_API_KEY 或设置环境变量。")

    logger.info(f"正在实例化模型: {model} (Base URL: {base_url})")
    
    # 如果 kwargs 里包含 streaming，就不再硬编码，否则默认为 True
    streaming = kwargs.pop("streaming", True)
    
    return ChatOpenAI(
        model=model,
        api_key=api_key,
        base_url=base_url,
        temperature=temperature,
        streaming=streaming,
        **kwargs
    )
