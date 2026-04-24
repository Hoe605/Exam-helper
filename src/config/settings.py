from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional, Literal

class Settings(BaseSettings):
    # LLM 配置
    llm_model: str = Field(default="glm-4-flash", alias="LLM_MODEL")
    llm_api_key: Optional[str] = Field(default=None, alias="LLM_API_KEY")
    llm_base_url: str = Field(default="https://open.bigmodel.cn/api/paas/v4/", alias="LLM_BASE_URL")

    # 数据库配置
    db_type: str = Field(default="sqlite") # e.g. sqlite, postgresql
    db_name: str = Field(default="exam_helper.db")
    database_url: Optional[str] = Field(default=None, alias="DATABASE_URL")
    secret_key: str = Field(..., alias="SECRET_KEY")
    app_env: Literal["development", "staging", "production"] = Field(default="development", alias="APP_ENV")
    cors_allow_origins_raw: Optional[str] = Field(default=None, alias="CORS_ALLOW_ORIGINS")

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.database_url:
            return self.database_url
        
        if self.db_type == "sqlite":
            return f"sqlite:///./{self.db_name}"
        
        # 默认回退或者处理其他类型
        return f"sqlite:///./{self.db_name}"

    @property
    def cors_allow_origins(self) -> list[str]:
        if self.cors_allow_origins_raw:
            return [origin.strip() for origin in self.cors_allow_origins_raw.split(",") if origin.strip()]

        if self.app_env == "development":
            return [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
            ]

        return []

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
