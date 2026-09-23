"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  speaker: "user" | "coach";
  text: string;
  nextSteps?: string[];
};
type CoachReply = { answer: string; next_steps: string[]; disclaimer: string };
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const suggestions = [
  "Mình chưa biết nên thử nghề nào",
  "Mình cần học kỹ năng gì tiếp?",
  "Góp ý cách trình bày CV của mình",
  "Mình nên hỏi cố vấn điều gì?",
];

function SendIcon() {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" /></svg>;
}

export default function Coach({ interest, goal, evidenceCount, userName }: { interest: string; goal: string; evidenceCount: number; userName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const conversationRef = useRef<HTMLDivElement>(null);
  const followLatestRef = useRef(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation && followLatestRef.current) conversation.scrollTop = conversation.scrollHeight;
  }, [messages, sending]);

  function handleConversationScroll() {
    const conversation = conversationRef.current;
    if (!conversation) return;
    followLatestRef.current = conversation.scrollHeight - conversation.scrollTop - conversation.clientHeight < 96;
  }

  async function sendQuestion(question: string) {
    const cleaned = question.trim();
    if (!cleaned || sending) return;
    followLatestRef.current = true;
    const messageId = crypto.randomUUID();
    setMessages((current) => [...current, { id: messageId, speaker: "user", text: cleaned }]);
    setDraft("");
    setSending(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/coach/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: cleaned, interest, goal, evidence_count: evidenceCount }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(typeof body?.detail === "string" ? body.detail : "Career Coach chưa thể trả lời lúc này.");
      const reply = body as CoachReply;
      setMessages((current) => [...current, {
        id: crypto.randomUUID(), speaker: "coach", text: reply.answer,
        nextSteps: reply.next_steps,
      }]);
    } catch (requestError) {
      setMessages((current) => current.filter((message) => message.id !== messageId));
      setError(requestError instanceof Error ? requestError.message : "Không thể kết nối Career Coach.");
      setDraft(cleaned);
    } finally { setSending(false); }
  }

  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void sendQuestion(draft); }
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void sendQuestion(draft);
    }
  }
  function newChat() { setMessages([]); setDraft(""); setError(""); followLatestRef.current = true; inputRef.current?.focus(); }

  return <section className={messages.length ? "ws-coach-page has-messages" : "ws-coach-page"} aria-labelledby="coach-page-title">
    <div className="ws-coach-toolbar"><div><span className="ws-coach-status-dot" aria-hidden="true" /><strong>Career Coach</strong><span className="ws-coach-status-text">Đang đồng hành cùng bạn</span></div>{messages.length > 0 && <button type="button" onClick={newChat}>+ Hội thoại mới</button>}</div>
    {messages.length === 0 ? <div className="ws-coach-intro"><span className="ws-coach-symbol" aria-hidden="true">✳</span><h1 id="coach-page-title">Bạn đang nghĩ về điều gì?</h1><p>Hỏi một điều bất kỳ về học tập, công việc hoặc bước tiếp theo. Coach sẽ trò chuyện cùng bạn trước khi đi vào định hướng chi tiết.</p><div className="ws-coach-suggestions" role="group" aria-label="Câu hỏi gợi ý">{suggestions.map((prompt) => <button type="button" key={prompt} onClick={() => void sendQuestion(prompt)}>{prompt}</button>)}</div></div> : <div className="ws-coach-conversation" ref={conversationRef} onScroll={handleConversationScroll} role="log" aria-label="Lịch sử trò chuyện với Career Coach" aria-live="polite" aria-relevant="additions" tabIndex={0}><h1 id="coach-page-title" className="sr-only">Cuộc trò chuyện với Career Coach</h1>{messages.map((message) => <article key={message.id} className={`ws-coach-message ${message.speaker === "coach" ? "is-coach" : "user"}`}><div className="ws-coach-message-author" aria-hidden="true">{message.speaker === "user" ? userName.charAt(0) || "B" : "✳"}</div><div className="ws-coach-message-content"><strong>{message.speaker === "user" ? userName || "Bạn" : "Career Coach"}</strong><div className="ws-coach-answer">{message.text.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>{message.nextSteps && message.nextSteps.length > 0 && <div className="ws-coach-next"><span>Có thể thử tiếp</span><ul>{message.nextSteps.map((step) => <li key={step}>{step}</li>)}</ul></div>}</div></article>)}{sending && <div className="ws-coach-thinking" role="status"><span className="ws-coach-message-author" aria-hidden="true">✳</span><span>Coach đang suy nghĩ<span className="ws-coach-thinking-dots" aria-hidden="true">…</span></span></div>}</div>}
    <div className="ws-coach-entry"><form className="ws-coach-composer" onSubmit={submit}><label className="sr-only" htmlFor="coach-draft">Nhắn cho Career Coach</label><textarea ref={inputRef} id="coach-draft" rows={2} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleKeyDown} placeholder="Nhắn cho Career Coach..." /><button type="submit" aria-label="Gửi tin nhắn" disabled={!draft.trim() || sending}><SendIcon /></button></form>{error && <p className="ws-coach-error" role="alert">{error} Nội dung của bạn vẫn ở ô nhập; hãy gửi lại khi sẵn sàng.</p>}<p className="ws-coach-disclosure">Enter để gửi · Shift + Enter để xuống dòng · Gợi ý AI chỉ để tham khảo</p></div>
  </section>;
}
