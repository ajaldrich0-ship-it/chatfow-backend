import os
from pathlib import Path
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    SYNC_DATABASE_URL: str = ""
    REDIS_URL: str = "redis://redis:6379/0"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    META_APP_ID: str = ""
    META_APP_SECRET: str = ""
    META_WEBHOOK_VERIFY_TOKEN: str = ""
    META_API_VERSION: str = "v19.0"

    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_BUCKET_NAME: str = "flowwa-media"
    AWS_REGION: str = "ap-south-1"

    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    # SMTP (for Send Email node)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    SMTP_FROM: str = "noreply@flowwa.app"
    SMTP_TLS: bool = True

    @model_validator(mode="after")
    def adjust_database_urls(self) -> "Settings":
        # Format DATABASE_URL for async operations
        if self.DATABASE_URL.startswith("postgresql://"):
            self.DATABASE_URL = self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
        
        # Populate SYNC_DATABASE_URL if missing or format it for sync operations
        if not self.SYNC_DATABASE_URL:
            self.SYNC_DATABASE_URL = self.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://", 1)
        elif self.SYNC_DATABASE_URL.startswith("postgresql+asyncpg://"):
            self.SYNC_DATABASE_URL = self.SYNC_DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://", 1)
            
        return self

    model_config = SettingsConfigDict(
        env_file=(
            os.path.join(os.getcwd(), ".env"),
            os.path.join(Path(__file__).resolve().parent.parent.parent, ".env"),
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

