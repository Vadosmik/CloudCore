from typing import Annotated, Literal, Optional
from urllib.parse import quote_plus

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
  project_name: str = "CloudCore Core-Service"
  version: str = "1.0.0"
  debug: bool = False

  internal_api_key: SecretStr

  # DB Settings
  postgres_user: str
  postgres_password: SecretStr
  postgres_db: str
  postgres_host: str
  postgres_port: int = 5432
  db_schema: str = "core"

  @property
  def database_url(self) -> str:
    password = quote_plus(self.postgres_password.get_secret_value())
    return f"postgresql+asyncpg://{self.postgres_user}:{password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"

  # JWT Settings
  jwt_secret: SecretStr
  jwt_algorithm: Literal["HS256", "HS384", "HS512"] = "HS256"

  model_config = SettingsConfigDict(
    env_file=".env",
    env_file_encoding="utf-8",
    extra="ignore"
  )

settings = Settings()