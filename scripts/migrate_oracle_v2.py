"""Upgrade v1 Oracle scores to six shares summing to 100, preserving answers."""

from pymongo import MongoClient

from cario.core.config import settings
from cario.oracle.questions import QUESTION_BANK, VERSION
from cario.oracle.scoring import SCORE_REVISION, score_answers, validate_answers


def main() -> None:
    if not settings.mongodb_url:
        raise RuntimeError("MONGODB_URL is not configured.")
    client = MongoClient(settings.mongodb_url, serverSelectionTimeoutMS=10_000)
    try:
        db = client["Cario"]
        if db["oracle_question"].count_documents({"version": VERSION}) != len(QUESTION_BANK):
            raise RuntimeError("Seed Oracle v2 questions before migrating results.")
        updated = 0
        for attempt in db["oracle_attempt"].find({"version": {"$in": [1, VERSION]}, "score_revision": {"$ne": SCORE_REVISION}}):
            if attempt.get("analysis"):
                raise RuntimeError("An attempt already has AI analysis; review it before rescoring.")
            selected = validate_answers(QUESTION_BANK, attempt["answers"], complete=True)
            scores = score_answers(QUESTION_BANK, selected)
            db["oracle_attempt"].update_one(
                {"_id": attempt["_id"], "score_revision": {"$ne": SCORE_REVISION}},
                {"$set": {"version": VERSION, "score_revision": SCORE_REVISION, "scores": scores, **({"source_version": 1} if attempt["version"] == 1 else {})}},
            )
            db["user"].update_one(
                {"_id": attempt["user_id"], "oracle_profile.attempt_id": str(attempt["_id"])},
                {"$set": {"oracle_profile.version": VERSION, "oracle_profile.score_revision": SCORE_REVISION, "oracle_profile.scores": scores}},
            )
            updated += 1
        drafts = db["user"].update_many(
            {"oracle_draft.version": 1}, {"$set": {"oracle_draft.version": VERSION}}
        ).modified_count
        print(f"Oracle v2: {updated} attempts rescored, {drafts} drafts preserved.")
    finally:
        client.close()


if __name__ == "__main__":
    main()
