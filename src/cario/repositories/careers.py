from typing import Any

from pymongo import ASCENDING, MongoClient


class CareerRepository:
    """The only module that knows MongoDB's career collection details."""

    def __init__(self, mongodb_url: str) -> None:
        self._client = MongoClient(mongodb_url, serverSelectionTimeoutMS=5_000)
        self._collection = self._client["Cario"]["career"]

    def list(self) -> list[dict[str, Any]]:
        return list(self._collection.find({}, {"_id": 0}).sort([("group", ASCENDING), ("title", ASCENDING)]))

    def close(self) -> None:
        self._client.close()
