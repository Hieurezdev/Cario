from pathlib import Path
import os

from dotenv import load_dotenv


PROJECT_ROOT = Path(os.getenv("CARIO_PROJECT_ROOT", Path(__file__).resolve().parents[3]))
load_dotenv(PROJECT_ROOT / ".env")


class Settings:
    api_prefix = "/api/v1"
    frontend_origins = tuple(
        origin.strip()
        for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")
        if origin.strip()
    )
    mongodb_url = os.getenv("MONGODB_URL")
    auth_secret = os.getenv("AUTH_SECRET", "development-only-change-me")
    qwen_base_url = os.getenv("QWEN_BASE_URL", "").rstrip("/")
    qwen_api_key = os.getenv("QWEN_API_KEY", "")
    qwen_model = os.getenv("QWEN_MODEL", "Qwen/Qwen3.5-35B-A3B-GPTQ-Int4")
    qwen_timeout = float(os.getenv("QWEN_TIMEOUT", "60"))
    careers_path = PROJECT_ROOT / "app" / "workspace" / "careers.json"


settings = Settings()
