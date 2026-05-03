from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "FinOps JP SaaS"
    debug: bool = False
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/finops_saas"
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 30
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    anthropic_api_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
