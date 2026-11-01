from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
  project_name: str = "CloudCore AWS-collector"
  version: str = "1.0.0"
  debug: bool = False

  core_api_url: str = "http://core-service:8080"
  internal_api_key: SecretStr
  core_api_timeout: float = 10.0

  # Scheduler (second)
  discovery_interval: int = Field(default=60, ge=1)
  metrics_interval: int = Field(default=60, ge=1)

  metrics_lookback_minutes: int = Field(default=15, ge=1)

  model_config = SettingsConfigDict(
    env_file=".env",
    env_file_encoding="utf-8",
    extra="ignore"
  )

settings = Settings()