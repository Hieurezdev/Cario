"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { teamMembers } from "./data";

type Mentor = { id: string; user_id: string | null; name: string; title: string; field: string; bio: string; skills: string[]; experience?: string; achievement?: string; contact_email?: string | null };
type Opportunity = { id: string; title: string; field: string; kind: string; summary: string; tasks: string[]; requirements: string[]; applyUrl: string };
type ConnectionTab = "jobs" | "mentors";

const sampleMentorEmails: Record<string, string> = {
  "Bảo mật": "security.mentor@example.com",
  "Dữ liệu": "data.mentor@example.com",
  "Thiết kế": "design.mentor@example.com",
};

const opportunities: Opportunity[] = [
  { id: "data", title: "Thực tập phân tích dữ liệu", field: "Dữ liệu", kind: "Thực tập", summary: "Chuyển dữ liệu thô thành báo cáo dễ dùng cho nhóm sản phẩm.", tasks: ["Làm sạch bảng dữ liệu và kiểm tra chất lượng đầu vào.", "Viết truy vấn SQL, tạo biểu đồ và trình bày những phát hiện chính."], requirements: ["Biết SQL cơ bản và thao tác với bảng tính.", "Có một dự án phân tích thể hiện cách đặt câu hỏi và rút kết luận."], applyUrl: "https://example.com/?position=data-intern" },
  { id: "product", title: "Thực tập phát triển sản phẩm số", field: "Công nghệ", kind: "Thực tập", summary: "Cùng nhóm xây dựng một tính năng từ yêu cầu đến bản chạy thử.", tasks: ["Tách yêu cầu thành các phần việc nhỏ và triển khai giao diện.", "Kiểm tra luồng người dùng, ghi nhận lỗi và cải thiện sau phản hồi."], requirements: ["Có nền tảng JavaScript và Git.", "Có sản phẩm cá nhân hoặc bài tập nhóm có thể trình bày vai trò của mình."], applyUrl: "https://example.com/?position=product-intern" },
  { id: "design", title: "Thực tập thiết kế sản phẩm", field: "Thiết kế", kind: "Thực tập", summary: "Tìm hiểu nhu cầu người dùng và phác thảo trải nghiệm cho một tính năng.", tasks: ["Phỏng vấn ngắn, tổng hợp vấn đề và đề xuất luồng sử dụng.", "Tạo wireframe, prototype và giải thích quyết định thiết kế."], requirements: ["Sử dụng được Figma và hiểu nguyên tắc UX cơ bản.", "Có case study thể hiện quá trình, không chỉ màn hình cuối."], applyUrl: "https://example.com/?position=design-intern" },
  { id: "security", title: "Thực tập an toàn thông tin", field: "Bảo mật", kind: "Thực tập", summary: "Hỗ trợ rà soát cấu hình và ghi nhận các vấn đề bảo mật cơ bản.", tasks: ["Kiểm tra checklist an toàn cho một hệ thống thử nghiệm.", "Viết báo cáo ngắn về rủi ro, cách tái hiện và hướng khắc phục."], requirements: ["Hiểu mạng máy tính và các nguyên tắc bảo mật web.", "Có bài lab hoặc ghi chép thực hành thể hiện cách phân tích vấn đề."], applyUrl: "https://example.com/?position=security-intern" },
  { id: "content", title: "Cộng tác nội dung số", field: "Truyền thông", kind: "Cộng tác", summary: "Lên ý tưởng và thử nội dung cho một sản phẩm hướng tới người trẻ.", tasks: ["Nghiên cứu đối tượng đọc và đề xuất thông điệp chính.", "Viết nội dung, theo dõi phản hồi và điều chỉnh cách thể hiện."], requirements: ["Viết rõ ràng và biết giải thích lựa chọn nội dung.", "Có mẫu bài viết hoặc chiến dịch nhỏ đã tự thực hiện."], applyUrl: "https://example.com/?position=content-collaborator" },
];

export default function Connections({ interest }: { interest: string }) {
  const [activeTab, setActiveTab] = useState<ConnectionTab>("jobs");
  const [field, setField] = useState("Tất cả");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const mentorDialogRef = useRef<HTMLDialogElement>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const opportunityDialogRef = useRef<HTMLDialogElement>(null);
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
  const [mentorContactEmail, setMentorContactEmail] = useState("");
  const [savingMentor, setSavingMentor] = useState(false);
  useEffect(() => {
    if (selectedMentor && !mentorDialogRef.current?.open) mentorDialogRef.current?.showModal();
  }, [selectedMentor]);
  useEffect(() => {
    if (selectedOpportunity && !opportunityDialogRef.current?.open) opportunityDialogRef.current?.showModal();
  }, [selectedOpportunity]);
  useEffect(() => {
    if (activeTab !== "mentors") return;
    const auth = JSON.parse(localStorage.getItem("cario-auth") || "null") as { token?: string } | null;
    if (!auth?.token) return;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
    fetch(`${base}/api/v1/mentors/me`, { headers: { Authorization: `Bearer ${auth.token}` } })
      .then((response) => response.ok ? response.json() : null)
      .then((mentor) => {
        if (!mentor) return;
        setMyMentor(true); setMentorTitle(mentor.title); setMentorField(mentor.field);
        setMentorSkills(mentor.skills.join(", ")); setMentorExperience(mentor.experience);
        setMentorAchievement(mentor.achievement); setMentorBio(mentor.bio); setMentorContactEmail(mentor.contact_email ?? "");
      }).catch(() => {});
  }, [activeTab]);
  async function saveMentor(event: FormEvent) {
    event.preventDefault();
    const auth = JSON.parse(localStorage.getItem("cario-auth") || "null") as { token?: string } | null;
    if (!auth?.token) { setError("Bạn cần đăng nhập để trở thành cố vấn."); return; }
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
    setSavingMentor(true); setError("");
    try {
      const response = await fetch(`${base}/api/v1/mentors/me`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ title: mentorTitle, field: mentorField, skills: mentorSkills.split(",").map((item) => item.trim()).filter(Boolean), experience: mentorExperience, achievement: mentorAchievement, bio: mentorBio, contact_email: mentorContactEmail.trim() || null }),
      });
      if (!response.ok) throw new Error("Không thể lưu hồ sơ cố vấn. Hãy kiểm tra đủ thông tin rồi thử lại.");
      const mentor: Mentor = await response.json();
      setMyMentor(true); setShowMentorForm(false);
      setMentors((current) => [mentor, ...current.filter((item) => item.name !== mentor.name)]);
    } catch (cause) { setError((cause as Error).message); }
    finally { setSavingMentor(false); }
  }
  useEffect(() => {
    if (activeTab !== "mentors") return;
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
  }, [activeTab, field]);
  const shownOpportunities = opportunities.filter((opportunity) => field === "Tất cả" || opportunity.field === field);
  const selectedMentorName = selectedMentor && (selectedMentor.user_id ? selectedMentor.name : `Cố vấn ${selectedMentor.field}`);
  const selectedMentorEmail = selectedMentor && (selectedMentor.contact_email || (!selectedMentor.user_id ? sampleMentorEmails[selectedMentor.field] : null));
  return <>
    <div className="ws-title"><p className="ws-eyebrow">07 / CONNECTOR</p><h1>Kết nối bắt đầu từ một hướng bạn muốn tìm hiểu</h1><p>Chọn việc làm để đọc mô tả vị trí, hoặc tìm cố vấn để hỏi về con đường bạn quan tâm.</p></div>
    <div className="ws-connection-tabs" role="tablist" aria-label="Việc làm và cố vấn" onKeyDown={(event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const next = activeTab === "jobs" ? "mentors" : "jobs";
      setActiveTab(next);
      document.getElementById(`connections-${next}-tab`)?.focus();
    }}>
      <button id="connections-jobs-tab" type="button" role="tab" aria-selected={activeTab === "jobs"} aria-controls="connections-jobs-panel" tabIndex={activeTab === "jobs" ? 0 : -1} onClick={() => setActiveTab("jobs")}>Việc làm <span>{opportunities.length} vị trí</span></button>
      <button id="connections-mentors-tab" type="button" role="tab" aria-selected={activeTab === "mentors"} aria-controls="connections-mentors-panel" tabIndex={activeTab === "mentors" ? 0 : -1} onClick={() => setActiveTab("mentors")}>Mentor cố vấn</button>
    </div>
    <div className="ws-filter-row ws-connection-filters" role="group" aria-label="Lĩnh vực quan tâm">{["Tất cả", "Dữ liệu", "Công nghệ", "Thiết kế", "Bảo mật", "Truyền thông"].map((item) => <button type="button" key={item} className={field === item ? "ws-chip selected" : "ws-chip"} aria-pressed={field === item} onClick={() => setField(item)}>{item}</button>)}</div>
    <section id="connections-jobs-panel" className="ws-connection-tab-panel" role="tabpanel" aria-labelledby="connections-jobs-tab" tabIndex={0} hidden={activeTab !== "jobs"}>
      <div className="ws-connection-layout">
        <div className="ws-connection-section ws-jobs-section"><p className="ws-eyebrow">CƠ HỘI / {field.toUpperCase()}</p><h2>Tìm hiểu vị trí trước khi ứng tuyển</h2><p>Đọc những việc thường làm và kỹ năng cần chuẩn bị cho từng hướng nghề.</p><div className="ws-job-list">{shownOpportunities.map((opportunity) => <article className="ws-job-card" key={opportunity.id}><div className="ws-job-meta"><span>{opportunity.field}</span><span>{opportunity.kind}</span></div><h3>{opportunity.title}</h3><p>{opportunity.summary}</p><button className="ws-connection-card-action" type="button" onClick={() => setSelectedOpportunity(opportunity)}>Xem chi tiết công việc <span aria-hidden="true">↗</span></button></article>)}</div><Link className="ws-link ws-jobs-next" href="/workspace/quests">Thử một Career Quest →</Link></div>
        <aside className="ws-connection-side"><div className="ws-panel"><p className="ws-eyebrow">TRƯỚC KHI ỨNG TUYỂN</p><h2>Chuẩn bị một bằng chứng cụ thể</h2><ol><li>Đọc JD và chọn kỹ năng bạn đã thực hành.</li><li>Ghi lại dự án, vai trò và kết quả của mình.</li><li>Đối chiếu CV với vị trí muốn thử.</li></ol><Link className="ws-link" href="/workspace/cv">Cải thiện CV →</Link></div></aside>
      </div>
    </section>
    <section id="connections-mentors-panel" className="ws-connection-tab-panel" role="tabpanel" aria-labelledby="connections-mentors-tab" tabIndex={0} hidden={activeTab !== "mentors"}>
      <div className="ws-mentor-join"><div><p className="ws-eyebrow">CHIA SẺ KINH NGHIỆM</p><h2>{myMentor ? "Hồ sơ cố vấn của bạn" : "Bạn muốn trở thành cố vấn?"}</h2><p>Giới thiệu chuyên môn, kinh nghiệm và thành tích để người học biết bạn có thể đồng hành ở đâu.</p></div><button type="button" className="ws-button dark" onClick={() => setShowMentorForm((current) => !current)}>{showMentorForm ? "Đóng biểu mẫu" : myMentor ? "Chỉnh sửa hồ sơ" : "Trở thành cố vấn"}</button></div>
      {showMentorForm && <form className="ws-panel ws-community-editor" onSubmit={saveMentor}><h2>Thông tin cố vấn</h2><p>Tên hiển thị lấy từ tài khoản CARIO của bạn.</p><label>Vị trí chuyên môn<input required minLength={3} value={mentorTitle} onChange={(event) => setMentorTitle(event.target.value)} placeholder="Ví dụ: Data Engineer" /></label><label>Lĩnh vực<input required minLength={2} value={mentorField} onChange={(event) => setMentorField(event.target.value)} /></label><label>Kỹ năng, ngăn cách bằng dấu phẩy<input required value={mentorSkills} onChange={(event) => setMentorSkills(event.target.value)} placeholder="SQL, Python, phân tích dữ liệu" /></label><label>Kinh nghiệm<textarea required minLength={10} value={mentorExperience} onChange={(event) => setMentorExperience(event.target.value)} /></label><label>Thành tích<textarea required minLength={10} value={mentorAchievement} onChange={(event) => setMentorAchievement(event.target.value)} /></label><label>Giới thiệu ngắn<textarea required minLength={10} value={mentorBio} onChange={(event) => setMentorBio(event.target.value)} /></label><label>Email liên hệ<input type="email" maxLength={254} value={mentorContactEmail} onChange={(event) => setMentorContactEmail(event.target.value)} placeholder="tenban@example.com" /></label><p className="ws-mentor-contact-note">Email này sẽ hiển thị trong hồ sơ cố vấn nếu bạn điền.</p><button className="ws-button dark" disabled={savingMentor}>{savingMentor ? "Đang lưu…" : "Lưu hồ sơ cố vấn"}</button></form>}
      <div className="ws-connection-layout">
        <div className="ws-connection-availability">
          <div className="ws-mentor-preview"><div className="ws-mentor-preview-mark">✳</div><div><p className="ws-eyebrow">MENTOR DESK / {field}</p><h2>Người đi trước trong lĩnh vực bạn chọn.</h2><p>Xem thế mạnh và kênh liên hệ của cố vấn để chuẩn bị câu hỏi cụ thể.</p></div><Link className="ws-button dark" href="/workspace/coach">Soạn câu hỏi với Coach</Link></div>
          {loading && <p role="status">Đang tải cố vấn…</p>}
          {error && <p className="ws-file-error" role="alert">{error}</p>}
          {!loading && !error && mentors.length === 0 && <div className="ws-empty"><h3>Chưa có cố vấn ở lĩnh vực này</h3><p>Thử chọn “Tất cả” hoặc một lĩnh vực khác. Hướng bạn đang quan tâm: {interest}.</p></div>}
          {!loading && !error && mentors.length > 0 && <div className="ws-card-grid ws-mentor-grid">{mentors.map((mentor) => {
            const name = mentor.user_id ? mentor.name : `Cố vấn ${mentor.field}`;
            return <article className="ws-mentor-card" key={mentor.id}><div className="ws-mentor-avatar">{name.charAt(0)}</div><h3>{name}</h3><small>{mentor.title} · {mentor.field}</small><p>{mentor.bio}</p><div className="ws-tag-row">{mentor.skills.map((skill) => <span key={skill}>{skill}</span>)}</div><button className="ws-connection-card-action" type="button" onClick={() => setSelectedMentor(mentor)}>Xem chi tiết hồ sơ <span aria-hidden="true">↗</span></button></article>;
          })}</div>}
        </div>
        <aside className="ws-connection-side"><div className="ws-panel"><p className="ws-eyebrow">TRƯỚC KHI KẾT NỐI</p><h2>Chuẩn bị một câu chuyện cụ thể</h2><ol><li>Chọn hướng nghề bạn muốn hỏi.</li><li>Ghi lại một dự án hoặc việc đã thử.</li><li>Viết câu hỏi mà bạn cần người đi trước góp ý.</li></ol><Link className="ws-link" href="/workspace/portfolio">Mở hồ sơ năng lực →</Link></div><div className="ws-team-panel"><p className="ws-eyebrow">NHÓM PHÁT TRIỂN CARIO</p><h3>CARENOVA · PTIT Hà Nội</h3><ul>{teamMembers.map((name) => <li key={name}>{name}</li>)}</ul></div></aside>
      </div>
    </section>
    <dialog className="ws-connection-dialog ws-mentor-dialog" ref={mentorDialogRef} aria-labelledby="ws-mentor-dialog-title" aria-describedby="ws-mentor-dialog-bio" onClose={() => setSelectedMentor(null)} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      {selectedMentor && <>
        <div className="ws-connection-dialog-top"><span className="ws-eyebrow">HỒ SƠ CỐ VẤN / {selectedMentor.field.toUpperCase()}</span><button type="button" onClick={() => mentorDialogRef.current?.close()} aria-label="Đóng hồ sơ cố vấn">×</button></div>
        <div className="ws-mentor-dialog-heading"><div className="ws-mentor-avatar">{selectedMentorName?.charAt(0)}</div><div><h2 id="ws-mentor-dialog-title">{selectedMentorName}</h2><p>{selectedMentor.title} · {selectedMentor.field}</p></div></div>
        <p className="ws-mentor-dialog-bio" id="ws-mentor-dialog-bio">{selectedMentor.bio}</p>
        <div className="ws-tag-row">{selectedMentor.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
        <div className="ws-mentor-dialog-details">{selectedMentor.experience && <section><h3>Kinh nghiệm</h3><p>{selectedMentor.experience}</p></section>}{selectedMentor.achievement && <section><h3>Thành tích</h3><p>{selectedMentor.achievement}</p></section>}</div>
        {selectedMentorEmail && <div className="ws-mentor-dialog-contact"><span>Email liên hệ</span><a href={`mailto:${selectedMentorEmail}`}>{selectedMentorEmail} ↗</a></div>}
      </>}
    </dialog>
    <dialog className="ws-connection-dialog ws-job-dialog" ref={opportunityDialogRef} aria-labelledby="ws-job-dialog-title" aria-describedby="ws-job-dialog-summary" onClose={() => setSelectedOpportunity(null)} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      {selectedOpportunity && <>
        <div className="ws-connection-dialog-top"><span className="ws-eyebrow">VIỆC LÀM / {selectedOpportunity.field.toUpperCase()}</span><button type="button" onClick={() => opportunityDialogRef.current?.close()} aria-label="Đóng chi tiết công việc">×</button></div>
        <div className="ws-job-dialog-heading"><span>{selectedOpportunity.kind}</span><h2 id="ws-job-dialog-title">{selectedOpportunity.title}</h2></div>
        <p className="ws-job-dialog-summary" id="ws-job-dialog-summary">{selectedOpportunity.summary}</p>
        <div className="ws-job-dialog-sections"><section><h3>Việc bạn sẽ làm</h3><ul>{selectedOpportunity.tasks.map((task) => <li key={task}>{task}</li>)}</ul></section><section><h3>Cần chuẩn bị</h3><ul>{selectedOpportunity.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul></section></div>
        <div className="ws-job-dialog-apply"><span>Ứng tuyển</span><a href={selectedOpportunity.applyUrl} target="_blank" rel="noopener noreferrer">Mở đường link ứng tuyển ↗</a></div>
      </>}
    </dialog>
  </>;
}
