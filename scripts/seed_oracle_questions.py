"""Seed versioned Oracle situations into Cario.oracle_question."""

from pymongo import ASCENDING, MongoClient, UpdateOne

from cario.core.config import settings
from cario.oracle.questions import QUESTION_BANK, VERSION


def main() -> None:
    if not settings.mongodb_url:
        raise RuntimeError("MONGODB_URL is not configured.")
    client = MongoClient(settings.mongodb_url, serverSelectionTimeoutMS=10_000)
    try:
        collection = client["Cario"]["oracle_question"]
        collection.create_index([("version", ASCENDING), ("key", ASCENDING)], unique=True)
        collection.create_index([("version", ASCENDING), ("order", ASCENDING)], unique=True)
        result = collection.bulk_write([
            UpdateOne({"version": VERSION, "key": question["key"]}, {"$setOnInsert": question}, upsert=True)
            for question in QUESTION_BANK
        ])
        count = collection.count_documents({"version": VERSION})
        if count != len(QUESTION_BANK):
            raise RuntimeError(f"Expected {len(QUESTION_BANK)} version-{VERSION} questions, found {count}.")
        print(f"Oracle questions v{VERSION}: {count} available; {result.upserted_count} inserted.")
    finally:
        client.close()


if __name__ == "__main__":
    main()
