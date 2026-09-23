"""Add clearly labeled demonstration evidence to one existing CARIO account.

Run: uv run python -m scripts.seed_user_evidence
This never creates an account or overwrites existing evidence.
"""

from pymongo import MongoClient

from cario.core.config import settings


EMAIL = "hoangchihien301105@gmail.com"
SAMPLES = [
    {
        "id": "sample-hoangchihien-data-review",
        "title": "Minh chứng mẫu · Bản phân tích dữ liệu bán hàng",
        "skill": "Phân tích dữ liệu",
        "source": "Dữ liệu minh họa CARIO — chưa phải thành tích đã xác thực",
        "reflection": "Bản ghi mẫu để thử giao diện hồ sơ. Hãy thay bằng sản phẩm và trải nghiệm thực tế của bạn.",
        "sample": True,
    },
    {
        "id": "sample-hoangchihien-website",
        "title": "Minh chứng mẫu · Phác thảo website cộng đồng",
        "skill": "Thiết kế giao diện",
        "source": "Dữ liệu minh họa CARIO — chưa phải thành tích đã xác thực",
        "reflection": "Bản ghi mẫu để thử giao diện hồ sơ. Hãy xóa hoặc thay bằng minh chứng thật trước khi chia sẻ hồ sơ.",
        "sample": True,
    },
]


def main() -> None:
    if not settings.mongodb_url:
        raise RuntimeError("MONGODB_URL is not configured.")
    client = MongoClient(settings.mongodb_url, serverSelectionTimeoutMS=10_000)
    try:
        users = client["Cario"]["user"]
        user = users.find_one({"email": EMAIL}, {"_id": 1, "workspace": 1})
        if user is None:
            raise RuntimeError(f"Existing account {EMAIL} was not found; no account was created.")
        if user.get("workspace") is None:
            users.update_one({"_id": user["_id"]}, {"$set": {"workspace": {"evidence": []}}})
        inserted = 0
        for sample in SAMPLES:
            result = users.update_one(
                {"_id": user["_id"], "workspace.evidence.id": {"$ne": sample["id"]}},
                {"$push": {"workspace.evidence": sample}},
            )
            inserted += result.modified_count
        print(f"Demo evidence seed: {inserted} added to {EMAIL}; existing records preserved.")
    finally:
        client.close()


if __name__ == "__main__":
    main()
