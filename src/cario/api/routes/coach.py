from fastapi import APIRouter, HTTPException

from cario.api.schemas import CoachRequest, CoachResponse
from cario.services.coach import answer_coach


router = APIRouter(prefix="/coach", tags=["coach"])


@router.post("/reply", response_model=CoachResponse)
def create_coach_reply(payload: CoachRequest) -> CoachResponse:
    try:
        return answer_coach(payload)
    except Exception as error:
        raise HTTPException(status_code=503, detail="Career Coach đang chưa sẵn sàng.") from error
