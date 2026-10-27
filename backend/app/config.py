from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.5-flash"
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001"
    port: int = 8000
    host: str = "0.0.0.0"

    # Scraping safety limits
    max_competitor_urls: int = 4
    max_internal_urls: int = 15
    max_page_download_bytes: int = 2 * 1024 * 1024  # 2MB
    request_timeout_seconds: float = 10.0
    gemini_timeout_seconds: float = 45.0

    model_config = SettingsConfigDict(
        env_file=("backend/.env", ".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> List[str]:
        if not self.allowed_origins:
            return ["*"]
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


settings = Settings()
