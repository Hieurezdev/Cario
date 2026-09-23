"use client";

import { FormEvent, useEffect, useState } from "react";
import { teamMembers } from "./workspace/data";

type Quest = {
  id: string;
  field: string;
  title: string;
  description: string;
  duration: string;
  output: string;
  steps: string[];
};

const quests: Quest[] = [
  {
    id: "data",
    field: "Dữ liệu",
    title: "Tìm câu chuyện trong một tập dữ liệu",
    description: "Thử làm sạch dữ liệu, đặt giả thuyết và trình bày một góc nhìn có ích.",
    duration: "2–3 giờ",
    output: "Một trang phân tích",
    steps: ["Chọn một câu hỏi muốn tìm hiểu", "Khám phá và làm sạch dữ liệu", "Trình bày phát hiện bằng ngôn ngữ dễ hiểu"],
  },
  {
    id: "design",
    field: "Thiết kế",
    title: "Thiết kế lại một trải nghiệm nhỏ",
    description: "Quan sát một khó khăn thường ngày và phác thảo cách giải quyết rõ ràng hơn.",
    duration: "1–2 giờ",
    output: "Bản phác thảo giải pháp",
    steps: ["Chọn một vấn đề cụ thể", "Phỏng vấn hoặc quan sát người dùng", "Phác thảo và giải thích lựa chọn thiết kế"],
  },
  {
    id: "marketing",
    field: "Truyền thông",
    title: "Kể câu chuyện cho một dự án địa phương",
    description: "Tạo ý tưởng truyền thông cho một sản phẩm hoặc hoạt động trong cộng đồng.",
    duration: "2 giờ",
    output: "Một ý tưởng chiến dịch",
    steps: ["Hiểu đối tượng cần tiếp cận", "Chọn thông điệp và kênh phù hợp", "Viết một bản nội dung"],
  },
];

const stages = [
  { label: "Hiểu mình", detail: "Nhìn lại điều bạn thích, cách bạn làm việc và giá trị bạn theo đuổi." },
  { label: "Thử nghề", detail: "Làm một nhiệm vụ gần với công việc thật để kiểm chứng sự phù hợp." },
  { label: "Chứng minh", detail: "Lưu sản phẩm, phản hồi và điều học được thành bằng chứng năng lực." },
  { label: "Kết nối", detail: "Gặp mentor, cộng đồng và những cơ hội phù hợp với hướng đi của bạn." },
];

const filters = ["Tất cả", "Dữ liệu", "Thiết kế", "Truyền thông"];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true" className="arrow">{diagonal ? "↗" : "→"}</span>;
}

export default function CarioExperience() {
  const [activeStage, setActiveStage] = useState(1);
  const [filter, setFilter] = useState("Tất cả");
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [savedQuest, setSavedQuest] = useState<string | null>(null);
  const [coachPrompt, setCoachPrompt] = useState("");
  const [coachAnswer, setCoachAnswer] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!selectedQuest) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedQuest(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedQuest]);

  const visibleQuests = filter === "Tất cả" ? quests : quests.filter((quest) => quest.field === filter);

  function askCoach(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = coachPrompt.trim();
    if (!question) return;
    const lower = question.toLocaleLowerCase("vi");
    const suggestion = lower.includes("cv")
      ? "Hãy chọn một dự án bạn từng làm và viết rõ: vấn đề, phần việc của bạn, kết quả. Một sản phẩm cụ thể sẽ giúp CV thuyết phục hơn."
      : lower.includes("mentor") || lower.includes("cố vấn")
        ? "Trước khi gặp mentor, hãy chuẩn bị một câu hỏi cụ thể về nghề và một trải nghiệm bạn muốn được góp ý."
        : lower.includes("ngành") || lower.includes("nghề")
          ? "Bạn có thể bắt đầu bằng một Career Quest ngắn ở lĩnh vực đang tò mò. Sau đó ghi lại việc nào khiến bạn hứng thú và việc nào làm bạn mất năng lượng."
          : "Bước nhỏ nhất hôm nay là chọn một hướng bạn tò mò, thử một nhiệm vụ thực tế và ghi lại điều mình học được. Bạn có thể bắt đầu ở mục Thử nghề.";
    setCoachAnswer(suggestion);
  }

  return (
    <>
      <a className="skip-link" href="#main">Đi tới nội dung chính</a>
      <header className="site-header">
        <div className="header-inner shell">
          <a className="wordmark" href="#top" aria-label="CARIO, về đầu trang"><span className="brand-symbol" aria-hidden="true">✳</span> CARIO<span className="wordmark-dot">.</span></a>
          <button className="menu-toggle" type="button" aria-label={menuOpen ? "Đóng menu" : "Mở menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Điều hướng chính">
            <a href="#hanh-trinh" onClick={() => setMenuOpen(false)}>Hành trình</a>
            <a href="#thu-nghe" onClick={() => setMenuOpen(false)}>Thử nghề</a>
            <a href="#co-van" onClick={() => setMenuOpen(false)}>Cố vấn</a>
            <a className="nav-action" href="/workspace" onClick={() => setMenuOpen(false)}>Vào ứng dụng <Arrow diagonal /></a>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="hero shell" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">CARIO / Career Intelligence Ecosystem</p>
            <h1 id="hero-title">Chưa rõ đường đi?<br /><em>Bắt đầu bằng một bước thử.</em></h1>
            <div className="hero-bottom">
              <p>Không cần biết ngay mình sẽ làm nghề gì. CARIO giúp bạn hiểu bản thân, thử những công việc thật và giữ lại bằng chứng cho mỗi bước trưởng thành.</p>
              <a className="button button-dark" href="/workspace">Bắt đầu hành trình <Arrow /></a>
            </div>
          </div>
          <div className="hero-art" aria-label="Sơ đồ hành trình từ câu hỏi đến trải nghiệm và hướng đi">
            <div className="art-top"><span>FIELD NOTES / 2026</span><span>01 — YOUR NEXT STEP</span></div>
            <div className="art-question">Mình có thể<br /><i>trở thành ai?</i></div>
            <svg className="route-svg" viewBox="0 0 500 310" fill="none" aria-hidden="true" preserveAspectRatio="none">
              <path d="M13 247 C105 247 117 69 217 76 C304 82 285 261 397 219 C447 200 457 124 494 85" stroke="currentColor" strokeWidth="2" strokeDasharray="4 8" />
              <circle cx="34" cy="240" r="9" fill="currentColor"/><circle cx="218" cy="76" r="9" fill="currentColor"/><circle cx="397" cy="219" r="9" fill="currentColor"/>
            </svg>
            <span className="route-label label-a">Tò mò</span><span className="route-label label-b">Thử</span><span className="route-label label-c">Hiểu rõ hơn</span>
            <div className="art-bottom"><span>Không có lộ trình cố định.</span><span>Chỉ có bước tiếp theo của bạn. ↗</span></div>
          </div>
        </section>

        <section className="statement" id="hanh-trinh">
          <div className="shell statement-inner">
            <p className="eyebrow">Một hành trình, không phải một bài trắc nghiệm</p>
            <h2>Hướng nghiệp có ý nghĩa khi bạn <em>được trải nghiệm.</em></h2>
            <div className="statement-bottom"><p>Trong ngành bạn học có nhiều hướng đi. Điều bạn cần là cơ hội kiểm chứng: mình thích công việc nào, đang làm tốt điều gì và nên học gì tiếp theo.</p><span className="tiny-mark">✳</span></div>
          </div>
        </section>

        <section className="journey section shell" aria-labelledby="journey-title">
          <div className="section-heading"><p className="eyebrow">Hành trình của bạn</p><h2 id="journey-title">Mỗi trải nghiệm làm bức tranh rõ hơn.</h2></div>
          <div className="journey-layout">
            <div className="stage-list" role="tablist" aria-label="Các bước hành trình nghề nghiệp">
              {stages.map((stage, index) => <button key={stage.label} type="button" className={activeStage === index ? "stage is-active" : "stage"} role="tab" aria-selected={activeStage === index} aria-controls="stage-panel" onClick={() => setActiveStage(index)}><span className="stage-index">0{index + 1}</span><span>{stage.label}</span><Arrow diagonal /></button>)}
            </div>
            <div className="stage-panel" id="stage-panel" role="tabpanel">
              <span className="panel-kicker">CHẶNG 0{activeStage + 1} / 04</span>
              <div className="stage-illustration" aria-hidden="true"><span className="illustration-ring ring-1"/><span className="illustration-ring ring-2"/><span className="illustration-core">✳</span></div>
              <div><h3>{stages[activeStage].label}</h3><p>{stages[activeStage].detail}</p></div>
            </div>
          </div>
        </section>

        <section className="quests section" id="thu-nghe" aria-labelledby="quests-title">
          <div className="shell">
            <div className="section-heading section-heading-split"><div><p className="eyebrow">Career Quest / Thử nghề</p><h2 id="quests-title">Thử một việc nhỏ.<br /><em>Hiểu một điều lớn.</em></h2></div><p>Những nhiệm vụ ngắn giúp bạn chạm vào công việc thực tế trước khi quyết định đi xa hơn.</p></div>
            <div className="filter-row" role="group" aria-label="Lọc lĩnh vực thử thách">{filters.map((item) => <button type="button" key={item} className={filter === item ? "filter is-active" : "filter"} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>
            <div className="quest-grid">{visibleQuests.map((quest) => <article className="quest-card" key={quest.id}><div className="quest-meta"><span>{quest.field}</span><span>{quest.duration}</span></div><div className="quest-symbol" aria-hidden="true">{quest.id === "data" ? "◌" : quest.id === "design" ? "▱" : "✳"}</div><h3>{quest.title}</h3><p>{quest.description}</p><div className="quest-footer"><span>Đầu ra: {quest.output}</span><button type="button" aria-label={`Xem thử thách ${quest.title}`} onClick={() => setSelectedQuest(quest)}><Arrow diagonal /></button></div></article>)}</div>
            <p className="context-note">Các thử thách là tình huống thực hành; hiện chưa có đơn vị giao bài.</p>
          </div>
        </section>

        <section className="identity section shell" aria-labelledby="identity-title">
          <div className="identity-copy"><p className="eyebrow">Career Identity</p><h2 id="identity-title">Hồ sơ của bạn nên kể được <em>những gì bạn đã làm.</em></h2><p>Không chỉ là một nhãn tính cách hay vài dòng trong CV. Mỗi nhiệm vụ, sản phẩm và phản hồi đều giúp bạn nhìn rõ năng lực đang lớn lên theo thời gian.</p><a className="text-link" href="/workspace/portfolio">Mở hồ sơ năng lực <Arrow /></a></div>
          <div className="identity-card" aria-label="Nhóm phát triển CARIO">
            <div className="profile-top"><span>CARIO / CARENOVA</span><span>PTIT · HÀ NỘI</span></div>
            <div className="profile-avatar">C</div>
            <h3>CARENOVA</h3>
            <p>Nhóm dự án phát triển CARIO</p>
            <div className="profile-divider" />
            <div className="profile-team"><span>THÀNH VIÊN</span><ul>{teamMembers.map((name) => <li key={name}>{name}</li>)}</ul></div>
            <div className="profile-stamp">HIỂU MÌNH · THỬ NGHỀ · TẠO GIÁ TRỊ ↗</div>
          </div>
        </section>

        <section className="coach section" id="co-van" aria-labelledby="coach-title"><div className="shell coach-layout"><div className="coach-copy"><p className="eyebrow">Career Coach</p><h2 id="coach-title">Có câu hỏi?<br /><em>Hãy bắt đầu từ đó.</em></h2><p>Một gợi ý nhỏ có thể giúp bạn chọn bước tiếp theo. Khi cần góc nhìn sâu hơn, hãy tìm đến mentor và cộng đồng.</p><div className="coach-caveat">Gợi ý hiện dựa trên câu hỏi bạn nhập. Khi cần góc nhìn sâu hơn, hãy gặp cố vấn.</div></div><div className="coach-card"><div className="chat-header"><span className="chat-status"/> CARIO Coach <span>BƯỚC TIẾP THEO</span></div><div className="chat-message"><span>CARIO</span><p>Bạn đang băn khoăn về hướng nghề, CV hay cách gặp cố vấn? Hãy hỏi một điều cụ thể.</p></div>{coachAnswer && <div className="chat-message response" aria-live="polite"><span>CARIO</span><p>{coachAnswer}</p></div>}<form onSubmit={askCoach} className="coach-form"><label className="sr-only" htmlFor="coach-input">Câu hỏi của bạn</label><input id="coach-input" value={coachPrompt} onChange={(event) => setCoachPrompt(event.target.value)} placeholder="Ví dụ: Mình nên thử nghề nào?"/><button type="submit" aria-label="Nhận gợi ý"><Arrow /></button></form></div></div></section>

        <section className="connections section shell" aria-labelledby="connections-title"><div className="section-heading"><p className="eyebrow">Connector / Cộng đồng</p><h2 id="connections-title">Đi xa hơn khi có người <em>đồng hành.</em></h2></div><div className="connection-grid"><article><span className="connection-icon" aria-hidden="true">↗</span><h3>Hỏi người đã đi trước</h3><p>Mentor và cựu sinh viên có thể giúp bạn hiểu công việc phía sau một chức danh và góp ý cho bước tiếp theo.</p></article><article><span className="connection-icon" aria-hidden="true">✳</span><h3>Tìm người cùng hướng</h3><p>Học cùng cộng đồng theo lĩnh vực, chia sẻ sản phẩm và nhận phản hồi từ những người cũng đang thử sức.</p></article><article><span className="connection-icon" aria-hidden="true">◌</span><h3>Giải bài toán thật</h3><p>Những dự án từ doanh nghiệp và địa phương tạo cơ hội để năng lực của sinh viên mang lại giá trị cụ thể.</p></article></div><p className="context-note">Danh sách cố vấn và đối tác sẽ được công bố khi được xác nhận.</p></section>

        <section className="closing section shell" id="bat-dau"><p className="eyebrow">Bước tiếp theo của bạn</p><h2>Không cần có sẵn câu trả lời.<br /><em>Hãy bắt đầu bằng sự tò mò.</em></h2><a className="button button-clay" href="/workspace/quests">Chọn một thử thách <Arrow /></a></section>
      </main>

      <footer className="footer"><div className="shell footer-inner"><div><a className="wordmark footer-logo" href="#top"><span className="brand-symbol" aria-hidden="true">✳</span> CARIO<span className="wordmark-dot">.</span></a><p>Hiểu mình. Thử nghề. Tạo giá trị.</p></div><div><span>KHÁM PHÁ</span><a href="#hanh-trinh">Hành trình</a><a href="#thu-nghe">Career Quest</a><a href="#co-van">Career Coach</a></div><div><span>VỀ DỰ ÁN</span><p>Ý tưởng hệ sinh thái hướng nghiệp của nhóm CARENOVA, thí điểm tại PTIT Hà Nội.</p></div></div><div className="shell footer-bottom"><span>© 2026 CARIO · CARENOVA.</span><a href="#top">Lên đầu trang ↑</a></div></footer>

      {selectedQuest && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedQuest(null); }}><div className="quest-modal" role="dialog" aria-modal="true" aria-labelledby="quest-modal-title"><button className="modal-close" type="button" aria-label="Đóng chi tiết thử thách" onClick={() => setSelectedQuest(null)}>×</button><p className="eyebrow">Career Quest / {selectedQuest.field}</p><h2 id="quest-modal-title">{selectedQuest.title}</h2><p>{selectedQuest.description}</p><dl><div><dt>Thời gian gợi ý</dt><dd>{selectedQuest.duration}</dd></div><div><dt>Sản phẩm cuối</dt><dd>{selectedQuest.output}</dd></div></dl><h3>Bạn sẽ thử</h3><ol>{selectedQuest.steps.map((step) => <li key={step}>{step}</li>)}</ol><button className="button button-clay" type="button" onClick={() => setSavedQuest(selectedQuest.id)}>{savedQuest === selectedQuest.id ? "Đã lưu vào kế hoạch" : "Lưu vào kế hoạch"} <Arrow /></button>{savedQuest === selectedQuest.id && <p className="save-note" role="status">Đã lưu trong phiên xem này. Tính năng tài khoản sẽ có ở phiên bản sau.</p>}</div></div>}
    </>
  );
}
