import jwt
from bson import ObjectId
from fastapi import Header, HTTPException, Request

from cario.core.config import settings


def current_user(request: Request, authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Vui lòng đăng nhập.")
    try:
        claims = jwt.decode(authorization[7:], settings.auth_secret, algorithms=["HS256"])
        user_id = ObjectId(claims["sub"])
    except (jwt.PyJWTError, KeyError, ValueError) as error:
        raise HTTPException(401, "Phiên đăng nhập không hợp lệ.") from error
    repository = getattr(request.app.state, "user_repository", None)
    if repository is None:
        raise HTTPException(503, "User database is not configured.")
    user = repository.find_by_id(user_id)
    if user is None:
        raise HTTPException(401, "Tài khoản không còn tồn tại.")
    return user


def optional_current_user(request: Request, authorization: str | None = Header(default=None)) -> dict | None:
    return current_user(request, authorization) if authorization else None
