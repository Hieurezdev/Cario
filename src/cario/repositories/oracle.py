from datetime import datetime, timedelta, timezone
from typing import Any

from pymongo import ASCENDING, MongoClient
from bson import ObjectId

from cario.oracle.scoring import SCORE_REVISION


class OracleRepository:
    def __init__(self, mongodb_url: str) -> None:
        self._client = MongoClient(mongodb_url, serverSelectionTimeoutMS=5_000)
        db = self._client["Cario"]
        self.questions = db["oracle_question"]
        self.attempts = db["oracle_attempt"]
        self.users = db["user"]
        self.attempts.create_index([("user_id", ASCENDING), ("completed_at", -1)])

    def close(self) -> None:
        self._client.close()

    def list_questions(self, version: int) -> list[dict[str, Any]]:
        return list(self.questions.find({"version": version}).sort("order", ASCENDING))

    def save_draft(self, user_id: object, version: int, answers: list[dict[str, str]]) -> None:
        self.users.update_one({"_id": user_id}, {"$set": {"oracle_draft": {"version": version, "answers": answers}}})

    def complete(self, user_id: object, version: int, answers: list[dict[str, str]], scores: dict[str, int]) -> dict:
        now = datetime.now(timezone.utc).isoformat()
        attempt = {"user_id": user_id, "version": version, "score_revision": SCORE_REVISION, "answers": answers, "scores": scores, "completed_at": now}
        attempt_id = self.attempts.insert_one(attempt).inserted_id
        result = {"attempt_id": str(attempt_id), "version": version, "score_revision": SCORE_REVISION, "scores": scores, "completed_at": now}
        self.users.update_one({"_id": user_id}, {"$set": {"oracle_profile": result}, "$unset": {"oracle_draft": ""}})
        return result

    def get_attempt(self, user_id: object, attempt_id: str) -> dict | None:
        if not ObjectId.is_valid(attempt_id):
            return None
        return self.attempts.find_one({"_id": ObjectId(attempt_id), "user_id": user_id})

    def claim_analysis(self, user_id: object, attempt_id: str) -> bool:
        now = datetime.now(timezone.utc)
        result = self.attempts.update_one(
            {
                "_id": ObjectId(attempt_id), "user_id": user_id,
                "analysis": {"$exists": False},
                "$or": [
                    {"analysis_status": {"$ne": "processing"}},
                    {"analysis_started_at": {"$lt": (now - timedelta(minutes=5)).isoformat()}},
                ],
            },
            {"$set": {"analysis_status": "processing", "analysis_started_at": now.isoformat()}},
        )
        return result.modified_count == 1

    def save_analysis(self, user_id: object, attempt_id: str, analysis: dict, model: str) -> None:
        fields = {"analysis": analysis, "analysis_model": model, "analysis_created_at": datetime.now(timezone.utc).isoformat()}
        self.attempts.update_one(
            {"_id": ObjectId(attempt_id), "user_id": user_id},
            {"$set": fields, "$unset": {"analysis_status": "", "analysis_started_at": ""}},
        )
        self.users.update_one(
            {"_id": user_id, "oracle_profile.attempt_id": attempt_id},
            {"$set": {f"oracle_profile.{key}": value for key, value in fields.items()}},
        )

    def release_analysis(self, user_id: object, attempt_id: str) -> None:
        self.attempts.update_one(
            {"_id": ObjectId(attempt_id), "user_id": user_id},
            {"$unset": {"analysis_status": "", "analysis_started_at": ""}},
        )
