from fastapi import APIRouter, HTTPException, Request

from cario.repositories.careers import CareerRepository


router = APIRouter(prefix="/careers", tags=["careers"])


@router.get("")
def list_careers(request: Request) -> list[dict]:
    repository: CareerRepository | None = getattr(request.app.state, "career_repository", None)
    if repository is None:
        raise HTTPException(status_code=503, detail="Career database is not configured.")
    return repository.list()
