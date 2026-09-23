from pymongo import MongoClient, UpdateOne

from cario.api.routes.auth import hash_password
from cario.core.config import settings


SAMPLE_USERS = [
    {"name": "Nguyễn Minh Anh", "email": "minhanh@example.com", "password": "CarioDemo2026!"},
    {"name": "Trần Gia Huy", "email": "giahuy@example.com", "password": "CarioDemo2026!"},
    {"name": "Lê Khánh Linh", "email": "khanhlinh@example.com", "password": "CarioDemo2026!"},
]


def main() -> None:
    if not settings.mongodb_url:
        raise RuntimeError("MONGODB_URL is not configured.")
    client = MongoClient(settings.mongodb_url, serverSelectionTimeoutMS=10_000)
    collection = client["Cario"]["user"]
    collection.create_index("email", unique=True)
    result = collection.bulk_write([
        UpdateOne({"email": item["email"]}, {"$setOnInsert": {"name": item["name"], "email": item["email"], "password_hash": hash_password(item["password"])}}, upsert=True)
        for item in SAMPLE_USERS
    ], ordered=False)
    print(f"User seed complete: {result.upserted_count} created; existing demo users were preserved.")
    client.close()


if __name__ == "__main__":
    main()
