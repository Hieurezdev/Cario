"use client";

import { FormEvent, useState } from "react";

type Message = { id: string; speaker: "user" | "coach"; text: string };

const suggestions = [
  "Mình nên thử nghề nào?",
  "Mình cần học kỹ năng gì tiếp?",
  "CV của mình nên cải thiện thế nào?",
  "Mình nên hỏi cố vấn điều gì?",
];

export default function Coach({ interest, goal, evidenceCount }: { interest: string; goal: string; evidenceCount: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");

  function sendQuestion(question: string) {
    const cleaned = question.trim();
    if (!cleaned) return;
    const lower = cleaned.toLocaleLowerCase("vi");
    const goalContext = goal ? ` Mục tiêu bạn đã lưu là “${goal}”.` : "";
    const reply = lower.includes("cv")
      ? `Hãy chọn một dự án và mô tả rõ vấn đề, phần việc của bạn, kết quả. Hiện hồ sơ của bạn có ${evidenceCount} bằng chứng đã ghi.${goalContext}`
      : lower.includes("mentor") || lower.includes("cố vấn")
        ? "Hãy chuẩn bị một câu hỏi cụ thể về công việc bạn muốn hiểu và một trải nghiệm cần được góp ý. Khi danh sách cố vấn được công bố, bạn có thể chọn người phù hợp với lĩnh vực đó."
        : lower.includes("kỹ năng") || lower.includes("học")
          ? `Chọn một vai trò bạn quan tâm, tìm một kỹ năng cần học và thử một nhiệm vụ ngắn để kiểm chứng. Mối quan tâm bạn đã chọn là ${interest}.${goalContext}`
          : `Với mối quan tâm về ${interest}, bạn có thể so sánh vài hướng nghề rồi thử một Career Quest. Hãy ghi lại việc nào khiến bạn hứng thú và điều bạn muốn hỏi thêm.${goalContext}`;
    setMessages((current) => [...current, { id: crypto.randomUUID(), speaker: "user", text: cleaned }, { id: crypto.randomUUID(), speaker: "coach", text: reply }]);
    setDraft("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendQuestion(draft);
  }

  return <section className={messages.length ? "ws-coach-page has-messages" : "ws-coach-page"} aria-labelledby="coach-page-title">
    <div className="ws-coach-toolbar"><span className="ws-eyebrow">CARIO / CAREER COACH</span>{messages.length > 0 && <button type="button" onClick={() => setMessages([])}>Cuộc trò chuyện mới</button>}</div>
    {messages.length === 0 ? <div className="ws-coach-intro"><span className="ws-coach-symbol" aria-hidden="true">✳</span><h1 id="coach-page-title">Hôm nay bạn muốn<br />tìm hiểu điều gì?</h1><p>Đặt một câu hỏi về hướng nghề, kỹ năng hoặc CV. Bắt đầu từ điều đang khiến bạn băn khoăn nhất.</p></div> : <div className="ws-coach-conversation" aria-live="polite"><h1 id="coach-page-title" className="sr-only">Cuộc trò chuyện với CARIO Coach</h1>{messages.map((message) => <div key={message.id} className={`ws-coach-message ${message.speaker}`}><div className="ws-coach-message-author">{message.speaker === "user" ? "Bạn" : "✳ CARIO"}</div><p>{message.text}</p></div>)}</div>}
    <div className="ws-coach-entry"><form className="ws-coach-composer" onSubmit={submit}><label className="sr-only" htmlFor="coach-draft">Câu hỏi của bạn</label><input id="coach-draft" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Hỏi CARIO về hướng đi của bạn..."/><button type="submit" aria-label="Gửi câu hỏi" disabled={!draft.trim()}>↑</button></form><div className="ws-coach-suggestions" role="group" aria-label="Câu hỏi gợi ý">{suggestions.map((prompt) => <button type="button" key={prompt} onClick={() => sendQuestion(prompt)}>{prompt}</button>)}</div><p className="ws-coach-disclosure">Gợi ý dựa trên câu hỏi và thông tin bạn đã lưu. Bạn là người quyết định bước tiếp theo.</p></div>
  </section>;
}
