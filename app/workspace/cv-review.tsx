"use client";

import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { careers, type Evidence } from "./data";
import { extractPdfText } from "./pdf";

export default function CvReview({ evidence }: { evidence: Evidence[] }) {
  const [cv, setCv] = useState("");
  const [target, setTarget] = useState("Kỹ sư dữ liệu");
  const [analyzed, setAnalyzed] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [readingFile, setReadingFile] = useState(false);

  async function onPdfSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setReadingFile(true);
    setFileError("");
    setFileName("");
    setAnalyzed(false);
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
        <p className="ws-help">PDF được đọc ngay trên thiết bị của bạn. Nội dung không được gửi lên máy chủ.</p>
        <label htmlFor="cv-target">Vị trí bạn muốn ứng tuyển</label>
        <select id="cv-target" value={target} onChange={(event) => { setTarget(event.target.value); setAnalyzed(false); }}>
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
        <textarea id="cv-content" className="ws-cv-textarea" value={cv} onChange={(event) => { setCv(event.target.value); setAnalyzed(false); setFileName(""); }} placeholder="Học vấn, dự án, kỹ năng, kinh nghiệm..." />
        <button type="button" className="ws-button dark" disabled={!cv.trim() || readingFile} onClick={() => setAnalyzed(true)}>Xem gợi ý cải thiện ↗</button>
      </section>
      <section className="ws-panel ws-review-panel">
        <p className="ws-eyebrow">GỢI Ý CHO {target.toUpperCase()}</p>
        {analyzed ? <>
          <h2>Nhìn lại CV của bạn</h2>
          <div className="ws-check-list">{checks.map((check) => <div key={check.label} className={check.found ? "pass" : "needs-work"}><span aria-hidden="true">{check.found ? "✓" : "!"}</span><div><strong>{check.label}</strong><p>{check.found ? "Đã tìm thấy nội dung liên quan." : check.action}</p></div></div>)}</div>
          <div className="ws-role-check"><h3>Đối chiếu với {target}</h3><p>Đã nhắc đến: {presentSkills.join(" · ") || "Chưa có kỹ năng gợi ý nào"}</p><p>Nên xem xét bổ sung: {unmentionedSkills.join(" · ") || "Đã nhắc đến các kỹ năng gợi ý"}</p><small>Việc chưa nhắc đến một kỹ năng trong CV không có nghĩa là bạn chưa có kỹ năng đó.</small></div>
          <div className="ws-review-summary"><strong>{proven.length ? `${proven.length} kỹ năng trong CV có bằng chứng ở hồ sơ` : "Chưa tìm thấy kỹ năng trùng với bằng chứng trong hồ sơ"}</strong><p>{proven.length ? proven.map((item) => item.skill).join(" · ") : "Hãy thêm sản phẩm hoặc dự án để chứng minh kỹ năng đã nêu."}</p><Link className="ws-link" href="/workspace/portfolio">Mở hồ sơ năng lực →</Link></div>
        </> : <div className="ws-review-placeholder"><span aria-hidden="true">▤</span><h2>Gợi ý sẽ hiện ở đây</h2><p>Tải PDF hoặc dán nội dung CV, rồi chọn “Xem gợi ý cải thiện”.</p></div>}
      </section>
    </div>
    <p className="ws-footnote">CARIO kiểm tra cấu trúc và từ khóa trong văn bản. Kết quả này không thay thế góp ý từ cố vấn hoặc nhà tuyển dụng.</p>
  </>;
}
