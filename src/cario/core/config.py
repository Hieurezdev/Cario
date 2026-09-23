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
    google_api_key = os.getenv("GOOGLE_API_KEY")
    mongodb_url = os.getenv("MONGODB_URL")
    auth_secret = os.getenv("AUTH_SECRET", "development-only-change-me")
    gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    careers_path = PROJECT_ROOT / "app" / "workspace" / "careers.json"


settings = Settings()
