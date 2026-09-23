from fastapi import APIRouter, HTTPException

from cario.api.schemas import CvReviewRequest, CvReviewResponse
from cario.services.gemini import review_cv


router = APIRouter(prefix="/cv", tags=["cv"])


@router.post("/review", response_model=CvReviewResponse)
def create_cv_review(payload: CvReviewRequest) -> CvReviewResponse:
    try:
        return review_cv(payload)
    except Exception as error:
        raise HTTPException(status_code=503, detail="Dịch vụ góp ý CV đang chưa sẵn sàng.") from error
