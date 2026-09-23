import hashlib, hmac, os, time
import jwt
from fastapi import APIRouter, HTTPException, Request, status
from pymongo.errors import DuplicateKeyError
from cario.api.schemas import LoginInput, RegisterInput
from cario.core.config import settings
from cario.repositories.users import UserRepository

router = APIRouter(prefix="/auth", tags=["auth"])
def repo(request: Request) -> UserRepository:
    value = getattr(request.app.state, "user_repository", None)
    if not value: raise HTTPException(503, "User database is not configured.")
    return value
def hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
    return f"{salt.hex()}${digest.hex()}"
def valid_password(password: str, stored: str) -> bool:
    salt_hex, digest_hex = stored.split("$", 1)
    return hmac.compare_digest(hash_password(password, bytes.fromhex(salt_hex)).split("$", 1)[1], digest_hex)
def token(user: dict) -> str:
    return jwt.encode({"sub": str(user["_id"]), "email": user["email"], "exp": int(time.time()) + 60 * 60 * 24 * 7}, settings.auth_secret, algorithm="HS256")
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterInput, request: Request) -> dict:
    if "@" not in payload.email: raise HTTPException(422, "Email không hợp lệ.")
    try: user = repo(request).create({"name": payload.name.strip(), "email": payload.email.lower().strip(), "password_hash": hash_password(payload.password)})
    except DuplicateKeyError as error: raise HTTPException(409, "Email đã được sử dụng.") from error
    return {"token": token(user), "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"]}}
@router.post("/login")
def login(payload: LoginInput, request: Request) -> dict:
    user = repo(request).find_by_email(payload.email.lower().strip())
    if not user or not valid_password(payload.password, user["password_hash"]): raise HTTPException(401, "Email hoặc mật khẩu không đúng.")
    return {"token": token(user), "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"]}}
