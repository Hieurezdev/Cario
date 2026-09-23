"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { teamMembers } from "./data";

export default function Connections({ interest }: { interest: string }) {
  const [field, setField] = useState("Tất cả");
  const [mentors, setMentors] = useState<{name:string;title:string;field:string;bio:string;skills:string[]}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMentorForm, setShowMentorForm] = useState(false);
  const [myMentor, setMyMentor] = useState(false);
  const [mentorTitle, setMentorTitle] = useState("");
  const [mentorField, setMentorField] = useState(interest);
  const [mentorSkills, setMentorSkills] = useState("");
  const [mentorExperience, setMentorExperience] = useState("");
  const [mentorAchievement, setMentorAchievement] = useState("");
  const [mentorBio, setMentorBio] = useState("");
  const [savingMentor, setSavingMentor] = useState(false);
  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("cario-auth") || "null") as { token?: string } | null;
    if (!auth?.token) return;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
    fetch(`${base}/api/v1/mentors/me`, { headers: { Authorization: `Bearer ${auth.token}` } })
      .then((response) => response.ok ? response.json() : null)
      .then((mentor) => {
        if (!mentor) return;
        setMyMentor(true); setMentorTitle(mentor.title); setMentorField(mentor.field);
        setMentorSkills(mentor.skills.join(", ")); setMentorExperience(mentor.experience);
        setMentorAchievement(mentor.achievement); setMentorBio(mentor.bio);
      }).catch(() => {});
  }, []);
  async function saveMentor(event: FormEvent) {
    event.preventDefault();
    const auth = JSON.parse(localStorage.getItem("cario-auth") || "null") as { token?: string } | null;
    if (!auth?.token) { setError("Bạn cần đăng nhập để trở thành cố vấn."); return; }
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
    setSavingMentor(true); setError("");
    try {
      const response = await fetch(`${base}/api/v1/mentors/me`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ title: mentorTitle, field: mentorField, skills: mentorSkills.split(",").map((item) => item.trim()).filter(Boolean), experience: mentorExperience, achievement: mentorAchievement, bio: mentorBio }),
      });
      if (!response.ok) throw new Error("Không thể lưu hồ sơ cố vấn. Hãy kiểm tra đủ thông tin rồi thử lại.");
      const mentor = await response.json();
      setMyMentor(true); setShowMentorForm(false);
      setMentors((current) => [mentor, ...current.filter((item) => item.name !== mentor.name)]);
    } catch (cause) { setError((cause as Error).message); }
    finally { setSavingMentor(false); }
  }
  useEffect(() => {
    const controller = new AbortController();
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
    const query = field === "Tất cả" ? "" : `?field=${encodeURIComponent(field)}`;
    setLoading(true);
    setError("");
    fetch(`${base}/api/v1/mentors${query}`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("Không thể tải danh sách cố vấn."); return response.json(); })
      .then(setMentors)
      .catch((cause) => { if (cause.name !== "AbortError") setError("Chưa kết nối được máy chủ cố vấn. Hãy kiểm tra backend rồi tải lại trang."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [field]);
  return <>
    <div className="ws-title"><p className="ws-eyebrow">07 / CONNECTOR</p><h1>Kết nối bắt đầu từ một hướng bạn muốn tìm hiểu</h1><p>Chọn lĩnh vực quan tâm để theo dõi cố vấn và cơ hội khi được công bố. Trong lúc này, hãy chuẩn bị câu hỏi và bằng chứng năng lực của bạn.</p></div>
    <div className="ws-filter-row" role="group" aria-label="Lĩnh vực quan tâm">{["Tất cả", "Dữ liệu", "Công nghệ", "Thiết kế", "Bảo mật", "Truyền thông"].map((item) => <button type="button" key={item} className={field === item ? "ws-chip selected" : "ws-chip"} aria-pressed={field === item} onClick={() => setField(item)}>{item}</button>)}</div>
    <div className="ws-mentor-join"><div><p className="ws-eyebrow">CHIA SẺ KINH NGHIỆM</p><h2>{myMentor ? "Hồ sơ cố vấn của bạn" : "Bạn muốn trở thành cố vấn?"}</h2><p>Giới thiệu chuyên môn, kinh nghiệm và thành tích để người học biết bạn có thể đồng hành ở đâu.</p></div><button type="button" className="ws-button dark" onClick={() => setShowMentorForm((current) => !current)}>{showMentorForm ? "Đóng biểu mẫu" : myMentor ? "Chỉnh sửa hồ sơ" : "Trở thành cố vấn"}</button></div>
    {showMentorForm && <form className="ws-panel ws-community-editor" onSubmit={saveMentor}><h2>Thông tin cố vấn</h2><p>Tên hiển thị lấy từ tài khoản CARIO của bạn.</p><label>Vị trí chuyên môn<input required minLength={3} value={mentorTitle} onChange={(event) => setMentorTitle(event.target.value)} placeholder="Ví dụ: Data Engineer" /></label><label>Lĩnh vực<input required minLength={2} value={mentorField} onChange={(event) => setMentorField(event.target.value)} /></label><label>Kỹ năng, ngăn cách bằng dấu phẩy<input required value={mentorSkills} onChange={(event) => setMentorSkills(event.target.value)} placeholder="SQL, Python, phân tích dữ liệu" /></label><label>Kinh nghiệm<textarea required minLength={10} value={mentorExperience} onChange={(event) => setMentorExperience(event.target.value)} /></label><label>Thành tích<textarea required minLength={10} value={mentorAchievement} onChange={(event) => setMentorAchievement(event.target.value)} /></label><label>Giới thiệu ngắn<textarea required minLength={10} value={mentorBio} onChange={(event) => setMentorBio(event.target.value)} /></label><button className="ws-button dark" disabled={savingMentor}>{savingMentor ? "Đang lưu…" : "Lưu hồ sơ cố vấn"}</button></form>}
    <div className="ws-connection-layout">
      <section className="ws-connection-availability"><div className="ws-mentor-preview"><div className="ws-mentor-preview-mark">✳</div><div><p className="ws-eyebrow">MENTOR DESK / {field}</p><h2>Người đi trước trong lĩnh vực bạn chọn.</h2><p>Xem thế mạnh của cố vấn rồi chuẩn bị câu hỏi cụ thể.</p></div><Link className="ws-button dark" href="/workspace/coach">Soạn câu hỏi với Coach</Link></div>{loading && <p role="status">Đang tải cố vấn…</p>}{error && <p className="ws-file-error" role="alert">{error}</p>}{!loading && !error && mentors.length === 0 && <div className="ws-empty"><h3>Chưa có cố vấn ở lĩnh vực này</h3><p>Thử chọn “Tất cả” hoặc một lĩnh vực khác. Hướng bạn đang quan tâm: {interest}.</p></div>}{mentors.length > 0 && <div className="ws-card-grid">{mentors.map((mentor) => <article className="ws-mentor-card" key={mentor.name}><div className="ws-mentor-avatar">{mentor.name[0]}</div><h3>{mentor.name}</h3><small>{mentor.title} · {mentor.field}</small><p>{mentor.bio}</p><div className="ws-tag-row">{mentor.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></article>)}</div>}<div className="ws-connection-section"><p className="ws-eyebrow">CƠ HỘI / {field.toUpperCase()}</p><h2>Thử trước, rồi tìm cơ hội phù hợp</h2><p>Hoàn thành một Career Quest và lưu sản phẩm vào hồ sơ để sẵn sàng khi dự án hoặc mentor phù hợp được mở.</p><Link className="ws-link" href="/workspace/quests">Khám phá Career Quest →</Link></div></section>
      <aside className="ws-connection-side"><div className="ws-panel"><p className="ws-eyebrow">TRƯỚC KHI KẾT NỐI</p><h2>Chuẩn bị một câu chuyện cụ thể</h2><ol><li>Chọn hướng nghề bạn muốn hỏi.</li><li>Ghi lại một dự án hoặc việc đã thử.</li><li>Viết câu hỏi mà bạn cần người đi trước góp ý.</li></ol><Link className="ws-link" href="/workspace/portfolio">Mở hồ sơ năng lực →</Link></div><div className="ws-team-panel"><p className="ws-eyebrow">NHÓM PHÁT TRIỂN CARIO</p><h3>CARENOVA · PTIT Hà Nội</h3><ul>{teamMembers.map((name) => <li key={name}>{name}</li>)}</ul></div></aside>
    </div>
  </>;
}
