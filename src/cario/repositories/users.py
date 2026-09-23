from typing import Any
from pymongo import MongoClient

class UserRepository:
    def __init__(self, url: str) -> None:
        self._client = MongoClient(url, serverSelectionTimeoutMS=5_000)
        self._collection = self._client["Cario"]["user"]
        self._collection.create_index("email", unique=True)
    def find_by_email(self, email: str) -> dict[str, Any] | None: return self._collection.find_one({"email": email.lower()})
    def find_by_id(self, user_id: object) -> dict[str, Any] | None: return self._collection.find_one({"_id": user_id})
    def save_workspace(self, user_id: object, profile: dict[str, Any]) -> None:
        self._collection.update_one({"_id": user_id}, {"$set": {"workspace": profile}})
    def create(self, user: dict[str, Any]) -> dict[str, Any]:
        user["_id"] = self._collection.insert_one(user).inserted_id
        return user
    def close(self) -> None: self._client.close()
