"use client";

import Link from "next/link";
import { ChangeEvent, useRef, useState } from "react";
import type { Career, Evidence } from "./data";
import { extractPdfText } from "./pdf";

type AiReview = {
  summary: string;
  strengths: string[];
  missing_or_unclear: string[];
  suggestions: { title: string; detail: string; priority: string }[];
  rewritten_project_example: string | null;
  disclaimer: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function apiError(body: unknown, fallback: string): string {
  if (typeof body === "object" && body && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((item) => typeof item === "object" && item && "msg" in item ? String(item.msg) : "Dữ liệu gửi lên chưa hợp lệ.").join(" ");
  }
  return fallback;
}

export default function CvReview({ careers, evidence }: { careers: Career[]; evidence: Evidence[] }) {
  const [cv, setCv] = useState("");
  const [target, setTarget] = useState("Kỹ sư dữ liệu");
  const [analyzed, setAnalyzed] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [readingFile, setReadingFile] = useState(false);
  const [review, setReview] = useState<AiReview | null>(null);
  const [reviewError, setReviewError] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const reviewDialogRef = useRef<HTMLDialogElement>(null);

  function clearReview() {
    reviewDialogRef.current?.close();
    setAnalyzed(false);
    setReview(null);
    setReviewError("");
  }

  async function requestReview() {
    if (!cv.trim()) return;
    setReviewing(true);
    setReviewError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/cv/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cv_text: cv,
          target_role: target,
          evidence: evidence.map(({ title, skill, source }) => ({ title, skill, source })),
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(apiError(body, "Không thể nhận góp ý AI lúc này."));
      setReview(body as AiReview);
      setAnalyzed(true);
      reviewDialogRef.current?.showModal();
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "Không thể kết nối tới dịch vụ góp ý CV.");
    } finally {
      setReviewing(false);
    }
  }

  async function onPdfSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setReadingFile(true);
    setFileError("");
    setFileName("");
    clearReview();
    try {
      const text = await extractPdfText(file);
      setCv(text);
      setFileName(file.name);
    } catch (error) {
      setFileError(error instanceof Error && [
        "Hãy chọn tệp PDF.",
        "PDF vượt quá 15 MB. Hãy chọn tệp nhỏ hơn.",
        "Tệp đã chọn không phải PDF hợp lệ.",
        "PDF có hơn 20 trang. Hãy chọn bản CV ngắn hơn.",
        "PDF không có văn bản có thể đọc. Hãy dán nội dung CV vào ô bên dưới.",
      ].includes(error.message) ? error.message : "Không đọc được PDF. Hãy kiểm tra tệp hoặc dán nội dung CV bên dưới.");
    } finally {
      setReadingFile(false);
    }
  }

  const text = cv.toLocaleLowerCase("vi");
  const checks = [
    { label: "Thông tin liên hệ", found: /@|email|điện thoại|phone/.test(text), action: "Thêm email hoặc cách liên hệ rõ ràng." },
    { label: "Học vấn", found: /học vấn|education|đại học|học viện/.test(text), action: "Nêu trường, ngành và giai đoạn học tập." },
    { label: "Dự án", found: /dự án|project|sản phẩm/.test(text), action: "Mô tả ít nhất một dự án với vai trò và kết quả cụ thể." },
    { label: "Kết quả có thể kiểm chứng", found: /\d+\s?%|\d+\s?(người|bản|dự án|giờ|tháng)/.test(text), action: "Bổ sung kết quả đo được hoặc sản phẩm có thể xem." },
  ];
  const proven = evidence.filter((item) => text.includes(item.skill.toLocaleLowerCase("vi")));
  const roleSkills = careers.find((career) => career.title === target)?.skills ?? [];
  const presentSkills = roleSkills.filter((skill) => text.includes(skill.toLocaleLowerCase("vi")));
  const unmentionedSkills = roleSkills.filter((skill) => !text.includes(skill.toLocaleLowerCase("vi")));

  return <>
    <div className="ws-title"><p className="ws-eyebrow">05 / CẢI THIỆN CV</p><h1>Viết rõ điều bạn thật sự đã làm</h1><p>Tải CV PDF hoặc dán nội dung để xem các mục cần cải thiện và đối chiếu kỹ năng với hồ sơ CARIO.</p></div>
    <div className="ws-two-col cv-columns">
      <section className="ws-panel">
        <h2>Nội dung CV</h2>
        <p className="ws-help">PDF được đọc trên thiết bị. Khi bạn chọn nhận góp ý AI, chỉ nội dung CV và vị trí mục tiêu được gửi tới API CARIO để phân tích.</p>
        <label htmlFor="cv-target">Vị trí bạn muốn ứng tuyển</label>
        <select id="cv-target" value={target} onChange={(event) => { setTarget(event.target.value); clearReview(); }}>
          {careers.map((career) => <option key={career.id}>{career.title}</option>)}
        </select>
        <div className="ws-upload-area">
          <span aria-hidden="true" className="ws-upload-icon">↥</span>
          <strong>{readingFile ? "Đang đọc PDF..." : fileName || "Tải CV từ máy của bạn"}</strong>
          <p>PDF · tối đa 15 MB · tối đa 20 trang</p>
          <label className="ws-button outline" htmlFor="cv-pdf">Chọn tệp PDF</label>
          <input id="cv-pdf" className="ws-file-input" type="file" accept=".pdf,application/pdf" onChange={onPdfSelected} disabled={readingFile} />
        </div>
        {fileError && <p className="ws-file-error" role="alert">{fileError}</p>}
        <label htmlFor="cv-content">Hoặc dán nội dung CV</label>
        <textarea id="cv-content" className="ws-cv-textarea" value={cv} onChange={(event) => { setCv(event.target.value); clearReview(); setFileName(""); }} placeholder="Học vấn, dự án, kỹ năng, kinh nghiệm..." />
        <button type="button" className="ws-button dark" disabled={!cv.trim() || readingFile || reviewing} onClick={requestReview}>{reviewing ? "Đang nhận góp ý AI..." : "Xem gợi ý cải thiện ↗"}</button>
        {reviewError && <p className="ws-file-error" role="alert">{reviewError}</p>}
      </section>
      <section className={analyzed ? "ws-panel ws-review-panel has-result" : "ws-panel ws-review-panel"} aria-label="Kết quả góp ý CV">
        <p className="ws-eyebrow">GỢI Ý CHO {target.toUpperCase()}</p>
        {analyzed ? <div className="ws-review-ready"><span aria-hidden="true">✓</span><h2>Gợi ý CV đã sẵn sàng</h2><p>Xem các mục cần làm rõ, kỹ năng liên quan và góp ý từ CARIO AI.</p><button type="button" className="ws-button dark" onClick={() => reviewDialogRef.current?.showModal()}>Xem chi tiết góp ý ↗</button></div> : <div className="ws-review-placeholder"><span aria-hidden="true">▤</span><h2>Gợi ý sẽ hiện ở đây</h2><p>Tải PDF hoặc dán nội dung CV, rồi chọn “Xem gợi ý cải thiện”.</p></div>}
      </section>
    </div>
    <dialog className="ws-cv-review-dialog" ref={reviewDialogRef} aria-labelledby="ws-cv-review-title" onClick={(event) => { if (event.target === event.currentTarget) reviewDialogRef.current?.close(); }}>
      {analyzed && <><div className="ws-cv-review-dialog-top"><p className="ws-eyebrow">GỢI Ý CHO {target.toUpperCase()}</p><button type="button" aria-label="Đóng góp ý CV" onClick={() => reviewDialogRef.current?.close()}>×</button></div><div className="ws-cv-review-dialog-body">
          <h2 id="ws-cv-review-title">Nhìn lại CV của bạn</h2>
          <div className="ws-check-list">{checks.map((check) => <div key={check.label} className={check.found ? "pass" : "needs-work"}><span aria-hidden="true">{check.found ? "✓" : "!"}</span><div><strong>{check.label}</strong><p>{check.found ? "Đã tìm thấy nội dung liên quan." : check.action}</p></div></div>)}</div>
          <div className="ws-role-check"><h3>Đối chiếu với {target}</h3><p>Đã nhắc đến: {presentSkills.join(" · ") || "Chưa có kỹ năng gợi ý nào"}</p><p>Nên xem xét bổ sung: {unmentionedSkills.join(" · ") || "Đã nhắc đến các kỹ năng gợi ý"}</p><small>Việc chưa nhắc đến một kỹ năng trong CV không có nghĩa là bạn chưa có kỹ năng đó.</small></div>
          <div className="ws-review-summary"><strong>{proven.length ? `${proven.length} kỹ năng trong CV có bằng chứng ở hồ sơ` : "Chưa tìm thấy kỹ năng trùng với bằng chứng trong hồ sơ"}</strong><p>{proven.length ? proven.map((item) => item.skill).join(" · ") : "Hãy thêm sản phẩm hoặc dự án để chứng minh kỹ năng đã nêu."}</p><Link className="ws-link" href="/workspace/portfolio">Mở hồ sơ năng lực →</Link></div>
          {review && <section className="ws-cv-ai-review" aria-labelledby="ws-cv-ai-title">
            <h3 id="ws-cv-ai-title">Góp ý từ CARIO AI</h3>
            <p className="ws-cv-ai-summary">{review.summary}</p>
            {review.strengths.length > 0 && <details className="ws-cv-ai-section"><summary><span>Điểm đang làm tốt</span><span>{review.strengths.length} ý <span aria-hidden="true">⌄</span></span></summary><div className="ws-cv-ai-detail"><ul>{review.strengths.map((strength, index) => <li key={index}>{strength}</li>)}</ul></div></details>}
            {review.missing_or_unclear.length > 0 && <details className="ws-cv-ai-section"><summary><span>Điểm cần làm rõ</span><span>{review.missing_or_unclear.length} ý <span aria-hidden="true">⌄</span></span></summary><div className="ws-cv-ai-detail"><ul>{review.missing_or_unclear.map((item, index) => <li key={index}>{item}</li>)}</ul></div></details>}
            {review.suggestions.length > 0 && <details className="ws-cv-ai-section"><summary><span>Đề xuất cải thiện</span><span>{review.suggestions.length} ý <span aria-hidden="true">⌄</span></span></summary><div className="ws-cv-ai-detail"><ol>{review.suggestions.map((suggestion, index) => <li key={`${suggestion.title}-${index}`}><strong>{suggestion.title} · {suggestion.priority}</strong><p>{suggestion.detail}</p></li>)}</ol></div></details>}
            {review.rewritten_project_example && <details className="ws-cv-ai-section"><summary><span>Ví dụ cách viết lại</span><span aria-hidden="true">⌄</span></summary><div className="ws-cv-ai-detail"><p>{review.rewritten_project_example}</p></div></details>}
            <small>{review.disclaimer}</small>
          </section>}
      </div></>}
    </dialog>
    <p className="ws-footnote">CARIO kiểm tra cấu trúc và từ khóa trong văn bản. Kết quả này không thay thế góp ý từ cố vấn hoặc nhà tuyển dụng.</p>
  </>;
}
