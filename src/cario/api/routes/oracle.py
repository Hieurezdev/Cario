import logging

from fastapi import APIRouter, Depends, HTTPException, Request

from cario.api.dependencies import current_user
from cario.api.schemas import OracleAnswersInput
from cario.oracle.questions import DIMENSION_LABELS, VERSION
from cario.oracle.scoring import InvalidAnswers, score_answers, validate_answers
from cario.repositories.oracle import OracleRepository
from cario.services.oracle_analysis import analyze_oracle
from cario.core.config import settings

router = APIRouter(prefix="/oracle", tags=["oracle"])
logger = logging.getLogger(__name__)


def repository(request: Request) -> OracleRepository:
    result = getattr(request.app.state, "oracle_repository", None)
    if result is None:
        raise HTTPException(503, "Oracle database is not configured.")
    return result


def questions(request: Request) -> list[dict]:
    result = repository(request).list_questions(VERSION)
    if not result:
        raise HTTPException(503, "Oracle chưa có tình huống. Hãy chạy script seed dữ liệu.")
    return result


@router.get("/questions")
def list_questions(request: Request, user: dict = Depends(current_user)) -> dict:
    items = questions(request)
    return {
        "version": VERSION,
        "dimensions": DIMENSION_LABELS,
        "questions": [{
            "key": item["key"], "order": item["order"], "chapter": item["chapter"],
            "scenario": item["scenario"], "prompt": item["prompt"],
            "options": [{"id": option["id"], "text": option["text"]} for option in item["options"]],
        } for item in items],
    }


@router.get("/draft")
def get_draft(user: dict = Depends(current_user)) -> dict:
    draft = user.get("oracle_draft")
    return draft if draft and draft.get("version") == VERSION else {"version": VERSION, "answers": []}


@router.put("/draft")
def save_draft(payload: OracleAnswersInput, request: Request, user: dict = Depends(current_user)) -> dict:
    if payload.version != VERSION:
        raise HTTPException(409, "Bộ tình huống đã thay đổi. Hãy tải lại Oracle.")
    items = questions(request)
    try:
        validate_answers(items, [answer.model_dump() for answer in payload.answers], complete=False)
    except InvalidAnswers as error:
        raise HTTPException(422, str(error)) from error
    data = [answer.model_dump() for answer in payload.answers]
    repository(request).save_draft(user["_id"], VERSION, data)
    return {"version": VERSION, "answers": data}


@router.post("/complete")
def complete(payload: OracleAnswersInput, request: Request, user: dict = Depends(current_user)) -> dict:
    if payload.version != VERSION:
        raise HTTPException(409, "Bộ tình huống đã thay đổi. Hãy tải lại Oracle.")
    items = questions(request)
    data = [answer.model_dump() for answer in payload.answers]
    try:
        selected = validate_answers(items, data, complete=True)
        scores = score_answers(items, selected)
    except InvalidAnswers as error:
        raise HTTPException(422, str(error)) from error
    return repository(request).complete(user["_id"], VERSION, data, scores)


@router.get("/result")
def latest_result(user: dict = Depends(current_user)) -> dict:
    return {"result": user.get("oracle_profile")}


@router.post("/analysis")
def create_analysis(request: Request, user: dict = Depends(current_user)) -> dict:
    latest = user.get("oracle_profile")
    if not latest:
        raise HTTPException(409, "Hãy hoàn thành 18 tình huống trước khi nhận phân tích AI.")
    repo = repository(request)
    attempt_id = latest["attempt_id"]
    attempt = repo.get_attempt(user["_id"], attempt_id)
    if attempt is None:
        raise HTTPException(404, "Không tìm thấy bài Oracle đã hoàn thành.")
    if attempt.get("analysis"):
        return {"analysis": attempt["analysis"], "cached": True}
    if not settings.google_api_key:
        raise HTTPException(503, "Chưa cấu hình GOOGLE_API_KEY cho phân tích AI.")
    if not repo.claim_analysis(user["_id"], attempt_id):
        raise HTTPException(409, "Oracle đang phân tích bài này. Hãy đợi một lát rồi tải lại kết quả.")
    try:
        analysis = analyze_oracle(attempt, questions(request)).model_dump()
        repo.save_analysis(user["_id"], attempt_id, analysis, settings.gemini_model)
        return {"analysis": analysis, "cached": False}
    except Exception as error:
        repo.release_analysis(user["_id"], attempt_id)
        logger.exception("Oracle AI analysis failed")
        if getattr(error, "code", None) == 429:
            raise HTTPException(429, "Gemini đang giới hạn lượt gọi. Hãy thử lại sau.") from error
        raise HTTPException(502, "Chưa thể tạo nhận xét AI. Điểm Oracle đã được lưu; hãy thử lại sau.") from error
