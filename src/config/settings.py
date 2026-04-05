from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional
import os

class Settings(BaseSettings):
    # LLM 配置
    llm_model: str = Field(default="glm-4-flash", alias="LLM_MODEL")
    llm_api_key: str = Field(..., alias="LLM_API_KEY")
    llm_base_url: str = Field(default="https://open.bigmodel.cn/api/paas/v4/", alias="LLM_BASE_URL")

    # 数据库配置
    db_type: str = Field(default="sqlite") # e.g. sqlite, postgresql
    db_name: str = Field(default="exam_helper.db")
    database_url: Optional[str] = Field(default=None, alias="DATABASE_URL")
    secret_key: str = Field(default="exam-helper-secret-key-2026", alias="SECRET_KEY")

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.database_url:
            return self.database_url
        
        if self.db_type == "sqlite":
            return f"sqlite:///./{self.db_name}"
        
        # 默认回退或者处理其他类型
        return f"sqlite:///./{self.db_name}"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
