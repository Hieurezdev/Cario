import logging

from fastapi import APIRouter, HTTPException

from cario.api.schemas import CvReviewRequest, CvReviewResponse
from cario.services.gemini import review_cv
from cario.core.config import settings


router = APIRouter(prefix="/cv", tags=["cv"])
logger = logging.getLogger(__name__)


@router.post("/review", response_model=CvReviewResponse)
def create_cv_review(payload: CvReviewRequest) -> CvReviewResponse:
    if not settings.google_api_key:
        raise HTTPException(status_code=503, detail="Máy chủ chưa cấu hình GOOGLE_API_KEY cho góp ý CV.")
    try:
        return review_cv(payload)
    except Exception as error:
        logger.exception("CV review failed")
        status = getattr(error, "code", None)
        if status == 429:
            raise HTTPException(status_code=429, detail="Gemini đang giới hạn lượt gọi. Nội dung CV vẫn ở ô nhập; hãy thử lại sau.") from error
        if status in (401, 403):
            raise HTTPException(status_code=503, detail="GOOGLE_API_KEY của máy chủ không được Gemini chấp nhận. Hãy kiểm tra quyền truy cập và thử lại.") from error
        raise HTTPException(status_code=502, detail="Gemini chưa phân tích được CV này. Hãy thử CV ngắn hơn hoặc gửi lại sau; nội dung đã nhập vẫn được giữ nguyên.") from error
