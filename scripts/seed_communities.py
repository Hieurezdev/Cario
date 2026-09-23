"""Idempotent demo data for the community → post → comment flow."""

from datetime import datetime, timezone

from pymongo import MongoClient

from cario.core.config import settings


COMMUNITIES = [
    ("du-lieu-cung-lam", "Dữ liệu cùng làm", "Học SQL, phân tích và kể chuyện bằng dữ liệu.", "Dữ liệu"),
    ("san-pham-so", "Xây sản phẩm số", "Từ vấn đề người dùng đến prototype đầu tiên.", "Công nghệ"),
    ("truyen-thong-tre", "Truyền thông trẻ", "Cùng thử nội dung, thương hiệu và chiến dịch.", "Truyền thông"),
]
POSTS = [
    ("du-lieu-cung-lam", "Mình nên bắt đầu SQL từ đâu?", "Mình đã biết Excel cơ bản và muốn thử một bài toán dữ liệu thật.", "Hỏi về nghề", "minhanh@example.com"),
    ("du-lieu-cung-lam", "Một cách kể chuyện bằng số liệu", "Mình thử biến bảng doanh thu thành ba insight ngắn cho hợp tác xã.", "Chia sẻ kinh nghiệm", "giahuy@example.com"),
    ("san-pham-so", "Tìm đồng đội làm prototype", "Mình có ý tưởng cải thiện luồng đăng ký hoạt động câu lạc bộ.", "Tìm đồng đội", "khanhlinh@example.com"),
    ("truyen-thong-tre", "Góp ý nội dung cho sản phẩm địa phương", "Mình đang thử viết thông điệp hướng tới sinh viên.", "Chia sẻ kinh nghiệm", "minhanh@example.com"),
]
COMMENT_BODY = "Bạn có thể bắt đầu bằng SELECT, WHERE rồi thử lọc một bảng dữ liệu nhỏ."


def main() -> None:
    if not settings.mongodb_url:
        raise RuntimeError("MONGODB_URL is not configured.")
    client = MongoClient(settings.mongodb_url, serverSelectionTimeoutMS=10_000)
    try:
        db = client["Cario"]
        now = datetime.now(timezone.utc).isoformat()
        users = {item["email"]: item["_id"] for item in db["user"].find(
            {"email": {"$in": ["minhanh@example.com", "giahuy@example.com", "khanhlinh@example.com"]}},
            {"email": 1},
        )}
        community_ids = {}
        for slug, name, description, field in COMMUNITIES:
            db["community"].update_one({"slug": slug}, {"$setOnInsert": {
                "slug": slug, "name": name, "description": description, "field": field, "created_at": now,
            }}, upsert=True)
            community = db["community"].find_one({"slug": slug})
            community_ids[slug] = community["_id"]
            if users.get("minhanh@example.com") and not community.get("owner_id"):
                db["community"].update_one({"_id": community["_id"]}, {"$set": {"owner_id": users["minhanh@example.com"]}})

        for slug, title, body, category, email in POSTS:
            query = {"community_id": community_ids[slug], "title": title}
            db["post"].update_one(query, {"$setOnInsert": {
                **query, "body": body, "category": category, "author": "CARENOVA", "score": 0, "created_at": now,
            }}, upsert=True)
            if users.get(email):
                db["post"].update_one({**query, "author_id": {"$exists": False}}, {"$set": {"author_id": users[email]}})

        first = db["post"].find_one({"community_id": community_ids[POSTS[0][0]], "title": POSTS[0][1]})
        if first:
            query = {"post_id": first["_id"], "body": COMMENT_BODY}
            db["comment"].update_one(query, {"$setOnInsert": {
                **query, "author": "CARENOVA", "created_at": now,
            }}, upsert=True)
            if users.get("giahuy@example.com"):
                db["comment"].update_one({**query, "author_id": {"$exists": False}}, {"$set": {"author_id": users["giahuy@example.com"]}})

        print({name: db[name].count_documents({}) for name in ("community", "post", "comment")})
    finally:
        client.close()


if __name__ == "__main__":
    main()
