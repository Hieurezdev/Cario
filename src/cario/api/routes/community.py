from fastapi import APIRouter, Depends, HTTPException, Request, status

from cario.api.dependencies import current_user, optional_current_user
from cario.api.schemas import CommentInput, CommunityInput, PostInput, VoteInput
from cario.repositories.community import CommunityRepository

router = APIRouter(prefix="/community", tags=["community"])


def repository(request: Request) -> CommunityRepository:
    value = getattr(request.app.state, "community_repository", None)
    if value is None:
        raise HTTPException(503, "Community database is not configured.")
    return value


@router.get("")
def list_communities(request: Request) -> list[dict]:
    return repository(request).list_communities()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_community(payload: CommunityInput, request: Request, user: dict = Depends(current_user)) -> dict:
    return repository(request).create_community(payload.model_dump(), user)


@router.get("/{community_id}")
def get_community(community_id: str, request: Request) -> dict:
    result = repository(request).get_community(community_id)
    if result is None:
        raise HTTPException(404, "Không tìm thấy cộng đồng.")
    return result


@router.patch("/{community_id}")
def update_community(community_id: str, payload: CommunityInput, request: Request, user: dict = Depends(current_user)) -> dict:
    result = repository(request).update_community(community_id, payload.model_dump(), user["_id"])
    if result is None:
        raise HTTPException(403, "Bạn không có quyền sửa cộng đồng này.")
    return result


@router.delete("/{community_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_community(community_id: str, request: Request, user: dict = Depends(current_user)) -> None:
    if not repository(request).delete_community(community_id, user["_id"]):
        raise HTTPException(403, "Bạn không có quyền xóa cộng đồng này.")


@router.get("/{community_id}/posts")
def list_posts(community_id: str, request: Request, user: dict | None = Depends(optional_current_user)) -> list[dict]:
    return repository(request).list_posts(community_id, user["_id"] if user else None)


@router.post("/{community_id}/posts", status_code=status.HTTP_201_CREATED)
def create_post(community_id: str, payload: PostInput, request: Request, user: dict = Depends(current_user)) -> dict:
    result = repository(request).create_post(community_id, payload.model_dump(), user)
    if result is None:
        raise HTTPException(404, "Không tìm thấy cộng đồng.")
    return result


@router.patch("/posts/{post_id}")
def update_post(post_id: str, payload: PostInput, request: Request, user: dict = Depends(current_user)) -> dict:
    result = repository(request).update_post(post_id, payload.model_dump(), user["_id"])
    if result is None:
        raise HTTPException(403, "Bạn không có quyền sửa bài viết này.")
    return result


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: str, request: Request, user: dict = Depends(current_user)) -> None:
    if not repository(request).delete_post(post_id, user["_id"]):
        raise HTTPException(403, "Bạn không có quyền xóa bài viết này.")


@router.post("/posts/{post_id}/vote")
def vote_post(post_id: str, payload: VoteInput, request: Request, user: dict = Depends(current_user)) -> dict:
    result = repository(request).vote_post(post_id, payload.value, user["_id"])
    if result is None:
        raise HTTPException(404, "Không tìm thấy bài viết.")
    return result


@router.get("/posts/{post_id}/comments")
def list_comments(post_id: str, request: Request) -> list[dict]:
    return repository(request).list_comments(post_id)


@router.post("/posts/{post_id}/comments", status_code=status.HTTP_201_CREATED)
def create_comment(post_id: str, payload: CommentInput, request: Request, user: dict = Depends(current_user)) -> dict:
    result = repository(request).create_comment(post_id, payload.body, user)
    if result is None:
        raise HTTPException(404, "Không tìm thấy bài viết.")
    return result


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: str, request: Request, user: dict = Depends(current_user)) -> None:
    if not repository(request).delete_comment(comment_id, user["_id"]):
        raise HTTPException(403, "Bạn không có quyền xóa bình luận này.")
