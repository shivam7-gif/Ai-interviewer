from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict




class Settings(BaseSettings):
  model_config = SettingsConfigDict(env_file=".env" , extra="ignore")
  groq_api_key: str
  groq_fast_model: str = "openai/gpt-oss-20b"
  groq_smart_model: str = "openai/gpt-oss-120b"
  groq_stt_model: str = "whisper-large-v3"
  qdrant_url : str = "http://localhost:6333"
  redis_url : str = "redis://localhost:6379"
  groq_tts_model : str = "canopylabs/orpheus-v1-english"
  groq_tts_voice : str = "autumn"


@lru_cache

def get_settings()-> Settings:
  return Settings()
