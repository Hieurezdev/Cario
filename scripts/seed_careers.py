import json

from pymongo import MongoClient, UpdateOne

from cario.core.config import settings


def main() -> None:
    if not settings.mongodb_url:
        raise RuntimeError("MONGODB_URL is not configured.")
    careers = json.loads(settings.careers_path.read_text(encoding="utf-8"))
    client = MongoClient(settings.mongodb_url, serverSelectionTimeoutMS=10_000)
    collection = client["Cario"]["career"]
    collection.create_index("id", unique=True)
    result = collection.bulk_write(
        [UpdateOne({"id": item["id"]}, {"$set": item}, upsert=True) for item in careers],
        ordered=False,
    )
    print(f"Career seed complete: {len(careers)} records; {result.upserted_count} inserted; {result.modified_count} updated.")
    client.close()


if __name__ == "__main__":
    main()
