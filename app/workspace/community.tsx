"use client";

import { FormEvent, useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
type Comment = { id: string; author_id?: string; author_name: string; body: string };
type Community = { id: string; name: string; description: string; field: string; owner_id?: string };
type Post = {
  id: string; community_id: string; author_id?: string; author_name: string;
  title: string; body: string; category: string; score: number; my_vote?: number;
  comment_count?: number; comments_preview?: Comment[]; created_at?: string;
};
type Account = { token: string; user: { id: string; name: string } };

function account(): Account | null {
  try { return JSON.parse(localStorage.getItem("cario-auth") || "null") as Account | null; } catch { return null; }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = account()?.token;
  const response = await fetch(`${API}/api/v1/community${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(typeof body?.detail === "string" ? body.detail : "Không thể tải dữ liệu cộng đồng.");
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

function VoteArrow({ direction }: { direction: "up" | "down" }) {
  return <svg className={direction === "down" ? "ws-vote-arrow down" : "ws-vote-arrow"} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5m-6.5 6.5L12 5l6.5 6.5" /></svg>;
}

function dateLabel(value?: string): string {
  if (!value) return "Vừa đăng";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Vừa đăng" : new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "numeric", year: "numeric" }).format(date);
}

export default function CommunityPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({});
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [commentingPost, setCommentingPost] = useState<string | null>(null);
  const [votingPost, setVotingPost] = useState<string | null>(null);
  const [communityForm, setCommunityForm] = useState<Community | "new" | null>(null);
  const [postForm, setPostForm] = useState<Post | "new" | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [field, setField] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("Hỏi về nghề");
  const userId = account()?.user.id;
  const userName = account()?.user.name || "Bạn";
  const selected = communities.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    api<Community[]>("")
      .then((items) => { setCommunities(items); setSelectedId((current) => current ?? items[0]?.id ?? null); })
      .catch((cause) => setError(cause.message))
      .finally(() => setLoadingCommunities(false));
  }, []);

  useEffect(() => {
    if (!selectedId) { setPosts([]); return; }
    let active = true;
    setLoadingPosts(true);
    setCommentsByPost({});
    setExpandedComments([]);
    api<Post[]>(`/${selectedId}/posts`)
      .then((items) => { if (active) { setPosts(items); setError(""); } })
      .catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoadingPosts(false); });
    return () => { active = false; };
  }, [selectedId]);

  function openCommunityForm(item: Community | "new") {
    setPostForm(null); setCommunityForm(item);
    setName(item === "new" ? "" : item.name);
    setDescription(item === "new" ? "" : item.description);
    setField(item === "new" ? "" : item.field);
  }
  function openPostForm(item: Post | "new") {
    setCommunityForm(null); setPostForm(item);
    setTitle(item === "new" ? "" : item.title);
    setBody(item === "new" ? "" : item.body);
    setCategory(item === "new" ? "Hỏi về nghề" : item.category);
  }
  async function saveCommunity(event: FormEvent) {
    event.preventDefault();
    if (!communityForm) return;
    try {
      const item = await api<Community>(communityForm === "new" ? "" : `/${communityForm.id}`, {
        method: communityForm === "new" ? "POST" : "PATCH", body: JSON.stringify({ name: name.trim(), description: description.trim(), field: field.trim() }),
      });
      setCommunities((current) => communityForm === "new" ? [...current, item] : current.map((entry) => entry.id === item.id ? item : entry));
      setSelectedId(item.id); setCommunityForm(null); setError("");
    } catch (cause) { setError((cause as Error).message); }
  }
  async function removeCommunity() {
    if (!selected || !window.confirm(`Xóa cộng đồng “${selected.name}” cùng mọi bài viết và bình luận?`)) return;
    try {
      await api<void>(`/${selected.id}`, { method: "DELETE" });
      const remaining = communities.filter((item) => item.id !== selected.id);
      setCommunities(remaining); setSelectedId(remaining[0]?.id ?? null); setError("");
    } catch (cause) { setError((cause as Error).message); }
  }
  async function savePost(event: FormEvent) {
    event.preventDefault();
    if (!selected || !postForm) return;
    try {
      const item = await api<Post>(postForm === "new" ? `/${selected.id}/posts` : `/posts/${postForm.id}`, {
        method: postForm === "new" ? "POST" : "PATCH", body: JSON.stringify({ title: title.trim(), body: body.trim(), category }),
      });
      setPosts((current) => postForm === "new" ? [{ ...item, comment_count: 0, comments_preview: [] }, ...current] : current.map((entry) => entry.id === item.id ? { ...entry, ...item } : entry));
      setPostForm(null); setError("");
    } catch (cause) { setError((cause as Error).message); }
  }
  async function removePost(post: Post) {
    if (!window.confirm(`Xóa bài “${post.title}” cùng mọi bình luận?`)) return;
    try {
      await api<void>(`/posts/${post.id}`, { method: "DELETE" });
      setPosts((current) => current.filter((item) => item.id !== post.id)); setError("");
    } catch (cause) { setError((cause as Error).message); }
  }
  async function vote(post: Post, value: 1 | -1) {
    if (votingPost) return;
    setVotingPost(post.id);
    try {
      const updated = await api<Post>(`/posts/${post.id}/vote`, { method: "POST", body: JSON.stringify({ value: post.my_vote === value ? 0 : value }) });
      setPosts((current) => current.map((item) => item.id === updated.id ? { ...item, score: updated.score, my_vote: updated.my_vote } : item));
      setError("");
    } catch (cause) { setError((cause as Error).message); }
    finally { setVotingPost(null); }
  }
  async function showComments(post: Post) {
    if (expandedComments.includes(post.id)) { setExpandedComments((current) => current.filter((id) => id !== post.id)); return; }
    try {
      const comments = await api<Comment[]>(`/posts/${post.id}/comments`);
      setCommentsByPost((current) => ({ ...current, [post.id]: comments }));
      setExpandedComments((current) => [...current, post.id]); setError("");
    } catch (cause) { setError((cause as Error).message); }
  }
  async function addComment(event: FormEvent, post: Post) {
    event.preventDefault();
    const text = replyDrafts[post.id]?.trim();
    if (!text || commentingPost) return;
    setCommentingPost(post.id);
    try {
      const item = await api<Comment>(`/posts/${post.id}/comments`, { method: "POST", body: JSON.stringify({ body: text }) });
      setCommentsByPost((current) => ({ ...current, [post.id]: [...(current[post.id] ?? post.comments_preview ?? []), item] }));
      setPosts((current) => current.map((entry) => entry.id === post.id ? {
        ...entry, comment_count: (entry.comment_count ?? 0) + 1,
        comments_preview: [...(entry.comments_preview ?? []), item].slice(0, 2),
      } : entry));
      setExpandedComments((current) => current.includes(post.id) ? current : [...current, post.id]);
      setReplyDrafts((current) => ({ ...current, [post.id]: "" })); setError("");
    } catch (cause) { setError((cause as Error).message); }
    finally { setCommentingPost(null); }
  }
  async function removeComment(post: Post, comment: Comment) {
    if (!window.confirm("Xóa bình luận này?")) return;
    try {
      await api<void>(`/comments/${comment.id}`, { method: "DELETE" });
      setCommentsByPost((current) => ({ ...current, [post.id]: (current[post.id] ?? []).filter((item) => item.id !== comment.id) }));
      setPosts((current) => current.map((entry) => entry.id === post.id ? {
        ...entry, comment_count: Math.max(0, (entry.comment_count ?? 0) - 1),
        comments_preview: (entry.comments_preview ?? []).filter((item) => item.id !== comment.id),
      } : entry)); setError("");
    } catch (cause) { setError((cause as Error).message); }
  }

  return <section className="ws-community-page">
    <div className="ws-feed-heading"><div><p className="ws-eyebrow">CỘNG ĐỒNG CARIO</p><h1>Cùng hỏi, cùng thử, cùng tiến bộ.</h1><p>Chọn nơi bạn muốn tham gia rồi theo dõi cuộc trò chuyện ngay trong dòng bài viết.</p></div><button className="ws-button dark" type="button" onClick={() => openCommunityForm("new")}>Tạo cộng đồng</button></div>
    {error && <p className="ws-file-error" role="alert">{error}</p>}
    {loadingCommunities ? <p role="status">Đang tải cộng đồng…</p> : communities.length === 0 ? <div className="ws-empty"><h2>Chưa có cộng đồng nào</h2><p>Hãy tạo nơi đầu tiên để mọi người chia sẻ.</p></div> : <>
      <div className="ws-feed-community-tabs" role="tablist" aria-label="Chọn cộng đồng">{communities.map((item) => <button key={item.id} type="button" role="tab" aria-selected={selectedId === item.id} className={selectedId === item.id ? "active" : ""} onClick={() => { setSelectedId(item.id); setPostForm(null); setCommunityForm(null); }}>{item.name}</button>)}</div>
      {selected && <><div className="ws-feed-community-intro"><div><span>{selected.field}</span><h2>{selected.name}</h2><p>{selected.description}</p></div>{selected.owner_id === userId && <div className="ws-feed-community-admin"><button type="button" onClick={() => openCommunityForm(selected)}>Sửa cộng đồng</button><button type="button" onClick={removeCommunity}>Xóa cộng đồng</button></div>}</div><div className="ws-feed-layout"><div className="ws-feed-main"><button type="button" className="ws-feed-compose-trigger" onClick={() => openPostForm("new")}><span className="ws-feed-avatar">{userName.charAt(0)}</span><span>Bạn muốn hỏi hoặc chia sẻ điều gì?</span><strong>Viết bài</strong></button>
        {postForm && <form className="ws-panel ws-community-editor ws-feed-editor" onSubmit={savePost}><h2>{postForm === "new" ? "Viết bài trong cộng đồng" : "Sửa bài viết"}</h2><label>Chủ đề<select value={category} onChange={(event) => setCategory(event.target.value)}><option>Hỏi về nghề</option><option>Chia sẻ kinh nghiệm</option><option>Tìm đồng đội</option></select></label><label>Tiêu đề<input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={3} maxLength={160} /></label><label>Nội dung<textarea value={body} onChange={(event) => setBody(event.target.value)} required minLength={3} maxLength={4000} /></label><div className="ws-feed-editor-actions"><button type="button" onClick={() => setPostForm(null)}>Hủy</button><button type="submit" className="ws-button dark">{postForm === "new" ? "Đăng bài" : "Lưu thay đổi"}</button></div></form>}
        <div className="ws-feed-count">Bài viết trong {selected.name} <span>{posts.length}</span></div>
        {loadingPosts ? <p role="status">Đang tải bài viết…</p> : posts.length === 0 ? <div className="ws-empty"><h3>Chưa có bài viết</h3><p>Hãy mở đầu bằng một câu hỏi hoặc điều bạn đã thử.</p></div> : <div className="ws-feed-post-list">{posts.map((post) => {
          const expanded = expandedComments.includes(post.id);
          const comments = expanded ? commentsByPost[post.id] ?? post.comments_preview ?? [] : post.comments_preview ?? [];
          const remaining = Math.max(0, (post.comment_count ?? 0) - comments.length);
          return <article className="ws-feed-post" key={post.id}><div className="ws-feed-post-header"><span className="ws-feed-avatar">{post.author_name.charAt(0)}</span><div><strong>{post.author_name}</strong><span>{post.category} · {dateLabel(post.created_at)}</span></div>{post.author_id === userId && <div className="ws-feed-post-admin"><button type="button" onClick={() => openPostForm(post)}>Sửa</button><button type="button" onClick={() => void removePost(post)}>Xóa</button></div>}</div><h3>{post.title}</h3><p className="ws-feed-post-body">{post.body}</p><div className="ws-feed-post-stats"><span>{post.score} lượt đánh giá</span><span>{post.comment_count ?? 0} bình luận</span></div><div className="ws-feed-actions"><div className="ws-feed-vote" aria-label="Đánh giá bài viết"><button type="button" aria-label={`Upvote bài ${post.title}`} aria-pressed={post.my_vote === 1} disabled={votingPost === post.id} onClick={() => void vote(post, 1)}><VoteArrow direction="up" /></button><strong aria-label={`Điểm ${post.score}`}>{post.score}</strong><button type="button" aria-label={`Downvote bài ${post.title}`} aria-pressed={post.my_vote === -1} disabled={votingPost === post.id} onClick={() => void vote(post, -1)}><VoteArrow direction="down" /></button></div><button type="button" className="ws-feed-comment-action" onClick={() => document.getElementById(`comment-${post.id}`)?.focus()}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8 8.6 8.6 0 0 1-3.5-.75L4 20l1.25-4.5A8 8 0 1 1 20 11.5Z" /></svg>Bình luận</button></div><div className="ws-feed-comments"><div className="ws-feed-comment-list">{comments.map((comment) => <div className="ws-feed-comment" key={comment.id}><span className="ws-feed-avatar small">{comment.author_name.charAt(0)}</span><div><div className="ws-feed-comment-bubble"><strong>{comment.author_name}</strong><p>{comment.body}</p></div>{comment.author_id === userId && <button type="button" className="ws-feed-comment-delete" onClick={() => void removeComment(post, comment)}>Xóa bình luận</button>}</div></div>)}</div>{(remaining > 0 || expanded) && <button type="button" className="ws-feed-more" onClick={() => void showComments(post)}>{expanded ? "Thu gọn bình luận" : `Xem thêm ${remaining} bình luận`}</button>}<form className="ws-feed-reply-form" onSubmit={(event) => void addComment(event, post)}><span className="ws-feed-avatar small">{userName.charAt(0)}</span><label className="sr-only" htmlFor={`comment-${post.id}`}>Bình luận bài {post.title}</label><input id={`comment-${post.id}`} value={replyDrafts[post.id] ?? ""} onChange={(event) => setReplyDrafts((current) => ({ ...current, [post.id]: event.target.value }))} placeholder="Viết bình luận..." maxLength={2000} /><button type="submit" disabled={!replyDrafts[post.id]?.trim() || commentingPost === post.id}>Gửi</button></form></div></article>;
        })}</div>}</div><aside className="ws-feed-side"><div><p className="ws-eyebrow">VỀ CỘNG ĐỒNG</p><h3>{selected.name}</h3><p>{selected.description}</p><span>{posts.length} bài viết đang được chia sẻ</span></div><p>Đặt câu hỏi cụ thể, kể điều bạn đã thử và góp ý với sự tôn trọng.</p></aside></div></>}
    </>}
    {communityForm && <div className="ws-feed-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCommunityForm(null); }}><form className="ws-feed-dialog" role="dialog" aria-modal="true" aria-labelledby="community-form-title" onSubmit={saveCommunity}><button className="ws-feed-dialog-close" type="button" aria-label="Đóng" onClick={() => setCommunityForm(null)}>×</button><h2 id="community-form-title">{communityForm === "new" ? "Tạo cộng đồng" : "Sửa cộng đồng"}</h2><label>Tên cộng đồng<input value={name} onChange={(event) => setName(event.target.value)} required minLength={3} maxLength={100} /></label><label>Lĩnh vực<input value={field} onChange={(event) => setField(event.target.value)} required minLength={2} maxLength={80} /></label><label>Mô tả<textarea value={description} onChange={(event) => setDescription(event.target.value)} required minLength={10} maxLength={500} /></label><div><button type="button" onClick={() => setCommunityForm(null)}>Hủy</button><button className="ws-button dark" type="submit">Lưu cộng đồng</button></div></form></div>}
  </section>;
}
