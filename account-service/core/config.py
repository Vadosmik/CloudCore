from typing import Literal
 
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL

FORBIDDEN_USERNAMES = {
  # obecne strony
  "studio", "catalog", "library", "settings", "profile",
  # konto i logowanie
  "login", "logout", "register", "signup", "signin", "auth", "account", "me",
  # prawdopodobne przyszłe strony
  "search", "explore", "about", "help", "support", "terms", "privacy",
  "pricing", "new", "notifications", "messages", "admin", "dashboard",
  "story", "stories", "u", "user", "users", "api", "static", "assets",
  # marka
  "lorely", "official", "staff", "moderator", "system", "root",
}

class Settings(BaseSettings):
  model_config = SettingsConfigDict(
    env_file=".env",
    env_file_encoding="utf-8",
    extra="ignore"
  )
  
  project_name: str = "CloudCore Users Service API"
  version: str = "1.0.0"    
  debug: bool = False

  jwt_secret: SecretStr
  jwt_algorithm: Literal["HS256", "HS384", "HS512"] = "HS256"
  jwt_expiration: int
  refresh_token_expiration: int

  # initial admin
  initial_admin_username: str | None = None
  initial_admin_name: str | None = None
  initial_admin_surname: str | None = None
  initial_admin_email: str | None = None
  initial_admin_password: SecretStr | None = None

  # DB Settings
  postgres_user: str
  postgres_password: SecretStr
  postgres_db: str
  postgres_host: str
  postgres_port: int = 5432
  db_schema: str = "accounts"

  @property
  def database_url(self) -> URL:
    return URL.create(
      drivername="postgresql+asyncpg",
      username=self.postgres_user,
      password=self.postgres_password.get_secret_value(),
      host=self.postgres_host,
      port=self.postgres_port,
      database=self.postgres_db,
    )

settings = Settings()