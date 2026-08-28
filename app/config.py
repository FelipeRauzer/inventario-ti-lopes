from pydantic_settings import BaseSettings, SettingsConfigDict

class AppConfig(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="APP_",
    )

    database_url: str = "sqlite:///./inventario.db"
    project_name: str = "Inventário TI Lopes"
    api_version: str = "v1"
    upload_dir: str = "./uploads"
    oracle_dsn: str = ""
    oracle_user: str = ""
    oracle_password: str = ""
    secret_key: str = ""
    
settings = AppConfig()