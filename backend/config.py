from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    database_url: str = 'sqlite:///./stitch_counter.db'
    supabase_url: str = ''
    supabase_jwt_secret: str = ''
    supabase_service_role_key: str = ''
    openai_api_key: str = ''
    openai_model: str = 'gpt-4o-mini'
    ssl_verify: bool = True
    cors_origins: str = 'http://localhost:5173'


settings = Settings()
