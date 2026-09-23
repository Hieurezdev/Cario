from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from cario.api.routes import auth, careers, coach, community, cv, mentors, oracle, profile
from cario.repositories.community import CommunityRepository
from cario.repositories.users import UserRepository
from cario.repositories.oracle import OracleRepository
from cario.core.config import settings
from cario.repositories.careers import CareerRepository


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.career_repository = CareerRepository(settings.mongodb_url) if settings.mongodb_url else None
    app.state.community_repository = CommunityRepository(settings.mongodb_url) if settings.mongodb_url else None
    app.state.user_repository = UserRepository(settings.mongodb_url) if settings.mongodb_url else None
    app.state.oracle_repository = OracleRepository(settings.mongodb_url) if settings.mongodb_url else None
    app.state.mongodb_url = settings.mongodb_url
    yield
    if app.state.career_repository:
        app.state.career_repository.close()
    if app.state.community_repository:
        app.state.community_repository.close()
    if app.state.user_repository:
        app.state.user_repository.close()
    if app.state.oracle_repository:
        app.state.oracle_repository.close()


app = FastAPI(title="CARIO API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.frontend_origins),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)
app.include_router(careers.router, prefix=settings.api_prefix)
app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(profile.router, prefix=settings.api_prefix)
app.include_router(oracle.router, prefix=settings.api_prefix)
app.include_router(mentors.router, prefix=settings.api_prefix)
app.include_router(coach.router, prefix=settings.api_prefix)
app.include_router(community.router, prefix=settings.api_prefix)
app.include_router(cv.router, prefix=settings.api_prefix)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def main() -> None:
    uvicorn.run("cario.main:app", host="127.0.0.1", port=8000, reload=True)
