from fastapi import APIRouter, Depends, HTTPException, Request
from pymongo import MongoClient, ReturnDocument

from cario.api.dependencies import current_user
from cario.api.schemas import MentorProfileInput

router = APIRouter(prefix="/mentors", tags=["mentors"])


def connection(request: Request) -> MongoClient:
    url = request.app.state.mongodb_url
    if not url:
        raise HTTPException(503, "Mentor database is not configured.")
    return MongoClient(url, serverSelectionTimeoutMS=5_000)


def public(item: dict) -> dict:
    return {**{key: value for key, value in item.items() if key not in ("_id", "user_id")}, "id": str(item["_id"]), "user_id": str(item["user_id"]) if item.get("user_id") else None}


@router.get("")
def list_mentors(request: Request, field: str | None = None) -> list[dict]:
    client = connection(request)
    try:
        query = {"field": field} if field else {}
        return [public(item) for item in client["Cario"]["mentor"].find(query).sort("name", 1)]
    finally:
        client.close()


@router.get("/me")
def my_mentor_profile(request: Request, user: dict = Depends(current_user)) -> dict | None:
    client = connection(request)
    try:
        item = client["Cario"]["mentor"].find_one({"user_id": user["_id"]})
        return public(item) if item else None
    finally:
        client.close()


@router.put("/me")
def become_mentor(payload: MentorProfileInput, request: Request, user: dict = Depends(current_user)) -> dict:
    client = connection(request)
    try:
        collection = client["Cario"]["mentor"]
        collection.create_index("user_id", unique=True, sparse=True)
        item = collection.find_one_and_update(
            {"user_id": user["_id"]},
            {"$set": {**payload.model_dump(), "name": user["name"], "user_id": user["_id"]}},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
        return public(item)
    finally:
        client.close()
