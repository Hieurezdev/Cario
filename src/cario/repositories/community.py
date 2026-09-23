from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from pymongo import DESCENDING, MongoClient, ReturnDocument


def object_id(value: str) -> ObjectId | None:
    return ObjectId(value) if ObjectId.is_valid(value) else None


class CommunityRepository:
    """MongoDB adapter for the community → post → comment hierarchy."""

    def __init__(self, mongodb_url: str) -> None:
        self._client = MongoClient(mongodb_url, serverSelectionTimeoutMS=5_000)
        database = self._client["Cario"]
        self.communities = database["community"]
        self.posts = database["post"]
        self.comments = database["comment"]
        self.users = database["user"]

    def close(self) -> None:
        self._client.close()

    def _author(self, document: dict[str, Any]) -> str:
        user_id = document.get("author_id")
        if user_id:
            user = self.users.find_one({"_id": user_id}, {"name": 1})
            if user:
                return user.get("name", "Thành viên CARIO")
        return document.get("author", "CARENOVA")

    def _public(self, document: dict[str, Any]) -> dict[str, Any]:
        result = dict(document)
        result["id"] = str(result.pop("_id"))
        for key in ("community_id", "post_id", "owner_id", "author_id"):
            if result.get(key):
                result[key] = str(result[key])
        result.pop("votes", None)
        if "body" in result:
            result["author_name"] = self._author(document)
        return result

    def list_communities(self) -> list[dict[str, Any]]:
        return [self._public(item) for item in self.communities.find().sort("name", 1)]

    def get_community(self, community_id: str) -> dict[str, Any] | None:
        oid = object_id(community_id)
        item = self.communities.find_one({"_id": oid}) if oid else None
        return self._public(item) if item else None

    def create_community(self, data: dict[str, Any], user: dict[str, Any]) -> dict[str, Any]:
        document = {**data, "owner_id": user["_id"], "created_at": datetime.now(timezone.utc).isoformat()}
        document["_id"] = self.communities.insert_one(document).inserted_id
        return self._public(document)

    def update_community(self, community_id: str, data: dict[str, Any], user_id: ObjectId) -> dict[str, Any] | None:
        oid = object_id(community_id)
        if not oid:
            return None
        item = self.communities.find_one_and_update({"_id": oid, "owner_id": user_id}, {"$set": data}, return_document=ReturnDocument.AFTER)
        return self._public(item) if item else None

    def delete_community(self, community_id: str, user_id: ObjectId) -> bool:
        oid = object_id(community_id)
        if not oid or not self.communities.find_one_and_delete({"_id": oid, "owner_id": user_id}):
            return False
        post_ids = [item["_id"] for item in self.posts.find({"community_id": oid}, {"_id": 1})]
        self.comments.delete_many({"post_id": {"$in": post_ids}})
        self.posts.delete_many({"community_id": oid})
        return True

    def list_posts(self, community_id: str, user_id: ObjectId | None = None) -> list[dict[str, Any]]:
        oid = object_id(community_id)
        if not oid:
            return []
        items = list(self.posts.find({"community_id": oid}).sort("created_at", DESCENDING))
        if not items:
            return []
        comments_by_post: dict[ObjectId, list[dict[str, Any]]] = {item["_id"]: [] for item in items}
        for comment in self.comments.find({"post_id": {"$in": list(comments_by_post)}}).sort("created_at", 1):
            comments_by_post[comment["post_id"]].append(comment)
        result = []
        for item in items:
            post = self._public(item)
            comments = comments_by_post[item["_id"]]
            post["comment_count"] = len(comments)
            post["comments_preview"] = [self._public(comment) for comment in comments[:2]]
            post["my_vote"] = item.get("votes", {}).get(str(user_id), 0) if user_id else 0
            result.append(post)
        return result

    def create_post(self, community_id: str, data: dict[str, Any], user: dict[str, Any]) -> dict[str, Any] | None:
        oid = object_id(community_id)
        if not oid or not self.communities.find_one({"_id": oid}):
            return None
        now = datetime.now(timezone.utc).isoformat()
        document = {**data, "community_id": oid, "author_id": user["_id"], "score": 0, "votes": {}, "created_at": now, "updated_at": now}
        document["_id"] = self.posts.insert_one(document).inserted_id
        return self._public(document)

    def update_post(self, post_id: str, data: dict[str, Any], user_id: ObjectId) -> dict[str, Any] | None:
        oid = object_id(post_id)
        item = self.posts.find_one_and_update({"_id": oid, "author_id": user_id}, {"$set": {**data, "updated_at": datetime.now(timezone.utc).isoformat()}}, return_document=ReturnDocument.AFTER) if oid else None
        return self._public(item) if item else None

    def delete_post(self, post_id: str, user_id: ObjectId) -> bool:
        oid = object_id(post_id)
        if not oid or not self.posts.find_one_and_delete({"_id": oid, "author_id": user_id}):
            return False
        self.comments.delete_many({"post_id": oid})
        return True

    def vote_post(self, post_id: str, value: int, user_id: ObjectId) -> dict[str, Any] | None:
        oid = object_id(post_id)
        item = self.posts.find_one({"_id": oid}) if oid else None
        if not item:
            return None
        key = str(user_id)
        previous = item.get("votes", {}).get(key, 0)
        updated = self.posts.find_one_and_update({"_id": oid}, {"$set": {f"votes.{key}": value}, "$inc": {"score": value - previous}}, return_document=ReturnDocument.AFTER)
        result = self._public(updated)
        result["my_vote"] = value
        return result

    def list_comments(self, post_id: str) -> list[dict[str, Any]]:
        oid = object_id(post_id)
        return [self._public(item) for item in self.comments.find({"post_id": oid}).sort("created_at", 1)] if oid else []

    def create_comment(self, post_id: str, body: str, user: dict[str, Any]) -> dict[str, Any] | None:
        oid = object_id(post_id)
        if not oid or not self.posts.find_one({"_id": oid}):
            return None
        document = {"post_id": oid, "author_id": user["_id"], "body": body, "created_at": datetime.now(timezone.utc).isoformat()}
        document["_id"] = self.comments.insert_one(document).inserted_id
        return self._public(document)

    def delete_comment(self, comment_id: str, user_id: ObjectId) -> bool:
        oid = object_id(comment_id)
        return bool(oid and self.comments.delete_one({"_id": oid, "author_id": user_id}).deleted_count)
