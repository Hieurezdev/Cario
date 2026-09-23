from fastapi import APIRouter, Depends, HTTPException, Request

from cario.api.dependencies import current_user
from cario.api.schemas import WorkspaceProfile
from cario.repositories.users import UserRepository

router = APIRouter(prefix="/profile", tags=["profile"])


def repository(request: Request) -> UserRepository:
    result = getattr(request.app.state, "user_repository", None)
    if not result:
        raise HTTPException(503, "User database is not configured.")
    return result


@router.get("/workspace")
def get_workspace(user: dict = Depends(current_user)) -> dict:
    return {"profile": user.get("workspace")}


@router.put("/workspace")
def save_workspace(payload: WorkspaceProfile, request: Request, user: dict = Depends(current_user)) -> dict:
    profile = payload.model_dump()
    repository(request).save_workspace(user["_id"], profile)
    return {"profile": profile}
