import logging

from fastapi import APIRouter, HTTPException

from cario.api.schemas import CoachRequest, CoachResponse
from cario.services.coach import answer_coach
from cario.services.llm_proxy import ProxyError


router = APIRouter(prefix="/coach", tags=["coach"])
logger = logging.getLogger(__name__)


@router.post("/reply", response_model=CoachResponse)
def create_coach_reply(payload: CoachRequest) -> CoachResponse:
    try:
        return answer_coach(payload)
    except ProxyError as error:
        logger.exception("Career Coach proxy failed")
        if error.code == 429:
            raise HTTPException(status_code=429, detail="Career Coach đang giới hạn lượt gọi. Hãy thử lại sau.") from error
        if error.code in (401, 403):
            raise HTTPException(status_code=503, detail="Khóa Qwen proxy chưa được chấp nhận. Hãy kiểm tra cấu hình máy chủ.") from error
        if error.code is None and "configured" in str(error):
            raise HTTPException(status_code=503, detail="Máy chủ chưa cấu hình Qwen proxy cho Career Coach.") from error
        raise HTTPException(status_code=502, detail="Qwen proxy chưa trả lời được. Hãy thử lại sau.") from error
    except Exception as error:
        logger.exception("Career Coach failed")
        raise HTTPException(status_code=502, detail="Career Coach gặp lỗi khi xử lý câu trả lời.") from error
