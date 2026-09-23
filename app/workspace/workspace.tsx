"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { careers, quests, type Career, type Evidence, type Quest, type SectionSlug } from "./data";
import CvReview from "./cv-review";
import Coach from "./coach";
import Connections from "./connections";
import Discover from "./discover";
import "./workspace.css";

type View = SectionSlug | "overview";
type Post = { id: string; title: string; body: string; category: string; author: string; likes: number };
type WorkspaceState = {
  audience: "student" | "school";
  interest: string;
  strength: string;
  value: string;
  currentSkills: string[];
  discoveryCompleted: boolean;
  goal: string;
  savedQuests: string[];
  completedQuests: string[];
  evidence: Evidence[];
  posts: Post[];
  likedPosts: string[];
  replies: Record<string, string[]>;
};

const initialState: WorkspaceState = {
  audience: "student", interest: "Dữ liệu", strength: "", value: "", currentSkills: [], discoveryCompleted: false, goal: "", savedQuests: [], completedQuests: [], evidence: [], posts: [], likedPosts: [], replies: {},
};
const navItems: { slug: View; label: string; symbol: string; group: string }[] = [
  { slug: "overview", label: "Tổng quan", symbol: "◫", group: "Hành trình" },
  { slug: "discover", label: "Khám phá bản thân", symbol: "✳", group: "Hành trình" },
  { slug: "compare", label: "So sánh nghề", symbol: "⇄", group: "Hành trình" },
  { slug: "quests", label: "Thử thách nghề", symbol: "↗", group: "Trải nghiệm" },
  { slug: "portfolio", label: "Hồ sơ năng lực", symbol: "▤", group: "Trải nghiệm" },
  { slug: "cv", label: "Cải thiện CV", symbol: "▣", group: "Trải nghiệm" },
  { slug: "coach", label: "Career Coach", symbol: "✺", group: "Kết nối" },
  { slug: "connections", label: "Cố vấn & cơ hội", symbol: "◎", group: "Kết nối" },
  { slug: "community", label: "Cộng đồng", symbol: "◌", group: "Kết nối" },
];
function loadState(): WorkspaceState {
  try {
    const raw = localStorage.getItem("cario-workspace-v1");
    if (!raw) return initialState;
    const saved: Partial<WorkspaceState> = JSON.parse(raw);
    return {
      audience: saved.audience === "school" ? "school" : "student",
      interest: typeof saved.interest === "string" ? saved.interest : initialState.interest,
      strength: typeof saved.strength === "string" ? saved.strength : "",
      value: typeof saved.value === "string" ? saved.value : "",
      currentSkills: Array.isArray(saved.currentSkills) ? saved.currentSkills.filter((item): item is string => typeof item === "string") : [],
      discoveryCompleted: saved.discoveryCompleted === true,
      goal: typeof saved.goal === "string" ? saved.goal : "",
      savedQuests: Array.isArray(saved.savedQuests) ? saved.savedQuests.filter((item): item is string => typeof item === "string") : [],
      completedQuests: Array.isArray(saved.completedQuests) ? saved.completedQuests.filter((item): item is string => typeof item === "string") : [],
      evidence: Array.isArray(saved.evidence) ? saved.evidence.filter((item): item is Evidence => typeof item?.id === "string" && typeof item?.title === "string" && typeof item?.skill === "string" && typeof item?.source === "string" && typeof item?.reflection === "string") : [],
      posts: Array.isArray(saved.posts) ? saved.posts.filter((item): item is Post => typeof item?.id === "string" && typeof item?.title === "string" && typeof item?.body === "string" && typeof item?.category === "string" && typeof item?.author === "string" && typeof item?.likes === "number") : [],
      likedPosts: Array.isArray(saved.likedPosts) ? saved.likedPosts.filter((item): item is string => typeof item === "string") : [],
      replies: saved.replies && typeof saved.replies === "object" && !Array.isArray(saved.replies) ? Object.fromEntries(Object.entries(saved.replies).filter((entry): entry is [string, string[]] => Array.isArray(entry[1]) && entry[1].every((item) => typeof item === "string"))) : {},
    };
  } catch {
    return initialState;
  }
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="ws-title"><p className="ws-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>;
}

function EmptyState({ title, body, href, action }: { title: string; body: string; href: string; action: string }) {
  return <div className="ws-empty"><span aria-hidden="true">✳</span><h3>{title}</h3><p>{body}</p><Link className="ws-link" href={href}>{action} →</Link></div>;
}

export default function Workspace({ section }: { section: View }) {
  const [state, setState] = useState<WorkspaceState>(initialState);
  const [loaded, setLoaded] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  useEffect(() => { setState(loadState()); setLoaded(true); }, []);
  useEffect(() => { if (loaded) localStorage.setItem("cario-workspace-v1", JSON.stringify(state)); }, [state, loaded]);
  const update = (changes: Partial<WorkspaceState>) => setState((current) => ({ ...current, ...changes }));
  const title = navItems.find((item) => item.slug === section)?.label ?? "Tổng quan";

  return <div className="workspace">
    <a className="skip-link" href="#workspace-main">Đi tới nội dung chính</a>
    <aside className={mobileNav ? "ws-sidebar is-open" : "ws-sidebar"} aria-label="Điều hướng sản phẩm">
      <div className="ws-brand"><Link href="/" aria-label="CARIO, về trang giới thiệu">✳ CARIO<span>.</span></Link><button type="button" className="ws-mobile-close" aria-label="Đóng menu" onClick={() => setMobileNav(false)}>×</button></div>
      <div className="ws-sidebar-caption">KHÔNG GIAN CỦA BẠN</div>
      <nav>{["Hành trình", "Trải nghiệm", "Kết nối"].map((group) => <div className="ws-nav-group" key={group}><p>{group}</p>{navItems.filter((item) => item.group === group).map((item) => <Link key={item.slug} onClick={() => setMobileNav(false)} className={section === item.slug ? "ws-nav-item active" : "ws-nav-item"} href={item.slug === "overview" ? "/workspace" : `/workspace/${item.slug}`}><span aria-hidden="true">{item.symbol}</span>{item.label}</Link>)}</div>)}</nav>
      <div className="ws-sidebar-foot"><div className="ws-avatar">C</div><div><strong>CARENOVA</strong><small>Nhóm dự án CARIO</small></div></div>
    </aside>
    {mobileNav && <button className="ws-nav-scrim" aria-label="Đóng menu" onClick={() => setMobileNav(false)} />}
    <div className="ws-main-column"><header className="ws-topbar"><button type="button" className="ws-mobile-menu" aria-label="Mở menu" onClick={() => setMobileNav(true)}>☰</button><div className="ws-breadcrumb">CARIO <span>/</span> {title}</div><div className="ws-top-actions"><Link href="/">Trang giới thiệu ↗</Link></div></header><main id="workspace-main" className="ws-content">
      {section === "overview" && <Overview state={state} />}
      {section === "discover" && loaded && <Discover profile={state} update={update} />}
      {section === "compare" && <Compare state={state} />}
      {section === "quests" && <Quests state={state} update={update} />}
      {section === "portfolio" && <Portfolio state={state} update={update} />}
      {section === "cv" && <CvReview evidence={state.evidence} />}
      {section === "coach" && <Coach interest={state.interest} goal={state.goal} evidenceCount={state.evidence.length} />}
      {section === "connections" && <Connections interest={state.interest} />}
      {section === "community" && <Community state={state} update={update} />}
    </main></div>
  </div>;
}

function Overview({ state }: { state: WorkspaceState }) {
  return <><div className="ws-overview-hero"><div><p className="ws-eyebrow">BẢN ĐỒ HÀNH TRÌNH / 2026</p><h1>Mỗi bước thử làm<br /><em>đường đi rõ hơn.</em></h1><p>Khám phá một hướng nghề, thử một bài toán thật và giữ lại điều bạn đã học được.</p><Link className="ws-button dark" href="/workspace/discover">Bắt đầu khám phá ↗</Link></div><div className="ws-route-card" aria-label="Hành trình bốn chặng"><span>HÀNH TRÌNH CỦA BẠN</span><ol><li>Hiểu mình</li><li>Thử nghề</li><li>Chứng minh năng lực</li><li>Kết nối cơ hội</li></ol><small>Bạn tự chọn bước tiếp theo.</small></div></div><div className="ws-stats"><div><strong>{state.savedQuests.length}</strong><span>Thử thách đã lưu</span></div><div><strong>{state.completedQuests.length}</strong><span>Thử thách đã hoàn thành</span></div><div><strong>{state.evidence.length}</strong><span>Bằng chứng năng lực</span></div></div><div className="ws-block-heading"><div><p className="ws-eyebrow">GỢI Ý BẮT ĐẦU</p><h2>Bạn muốn làm gì hôm nay?</h2></div></div><div className="ws-action-grid"><Link href="/workspace/discover"><span>01 / HIỂU MÌNH</span><h3>Khám phá điều mình quan tâm</h3><p>Chọn một lĩnh vực và xem các hướng đi có thể thử.</p><b>Khám phá ↗</b></Link><Link href="/workspace/quests"><span>02 / THỬ NGHỀ</span><h3>Thử một bài toán thực tế</h3><p>Bắt đầu từ nhiệm vụ ngắn để kiểm chứng sự phù hợp.</p><b>Xem thử thách ↗</b></Link><Link href="/workspace/portfolio"><span>03 / GHI LẠI</span><h3>Giữ bằng chứng đã tạo ra</h3><p>Lưu sản phẩm và điều học được vào hồ sơ năng lực.</p><b>Mở hồ sơ ↗</b></Link></div><p className="ws-footnote">Thông tin bạn ghi trong hành trình này được lưu trên trình duyệt của bạn.</p></>;
}

function Compare({ state }: { state: WorkspaceState }) {
  const [selected, setSelected] = useState<string[]>(() => careers.filter((career) => career.group === state.interest).map((career) => career.id));
  useEffect(() => { setSelected(careers.filter((career) => career.group === state.interest).map((career) => career.id)); }, [state.interest]);
  const shown = careers.filter((career) => selected.includes(career.id));
  return <><SectionTitle eyebrow="02 / SO SÁNH LỰA CHỌN" title="Đặt các hướng nghề cạnh nhau" description="So sánh công việc, kỹ năng và trải nghiệm nên thử. Những gợi ý này giúp bạn đặt câu hỏi tốt hơn, không thay bạn quyết định."/><div className="ws-panel"><h2>Chọn tối đa 3 hướng nghề</h2><div className="ws-filter-row">{careers.map((career) => <button type="button" key={career.id} className={selected.includes(career.id) ? "ws-chip selected" : "ws-chip"} aria-pressed={selected.includes(career.id)} onClick={() => setSelected((current) => current.includes(career.id) ? current.filter((id) => id !== career.id) : current.length < 3 ? [...current, career.id] : current)}>{career.title}</button>)}</div><p className="ws-help">Mối quan tâm hiện tại trong hồ sơ: <strong>{state.interest}</strong>. Chọn bỏ một hướng trước khi thêm hướng khác.</p></div>{shown.length ? <div className="ws-compare-scroll"><table className="ws-compare-table"><thead><tr><th scope="col">Tiêu chí</th>{shown.map((career) => <th scope="col" key={career.id}>{career.title}</th>)}</tr></thead><tbody><CompareRow label="Liên quan mối quan tâm" careers={shown} value={(career) => career.group === state.interest ? "Cùng lĩnh vực bạn đã chọn" : "Lĩnh vực khác; nên thử trước khi quyết định"}/><CompareRow label="Kỹ năng bạn đã chọn" careers={shown} value={(career) => career.skills.filter((skill) => state.currentSkills.includes(skill)).join(" · ") || "Chưa chọn kỹ năng trùng khớp"}/><CompareRow label="Chưa ghi nhận trong khám phá" careers={shown} value={(career) => career.skills.filter((skill) => !state.currentSkills.includes(skill)).join(" · ") || "Đã chọn các kỹ năng được liệt kê"}/><CompareRow label="Công việc" careers={shown} value={(career) => career.description}/><CompareRow label="Kỹ năng liên quan" careers={shown} value={(career) => career.skills.join(" · ")}/><CompareRow label="Cần tìm hiểu thêm" careers={shown} value={(career) => career.nextSkills.join(" · ")}/><CompareRow label="Trải nghiệm nên thử" careers={shown} value={(career) => career.tryThis}/><CompareRow label="Lộ trình tham khảo" careers={shown} value={(career) => career.path}/><CompareRow label="Người nên hỏi" careers={shown} value={(career) => career.mentor}/></tbody></table></div> : <EmptyState title="Chưa chọn hướng nghề" body="Chọn ít nhất một nghề ở phía trên để xem thông tin so sánh." href="/workspace/discover" action="Quay lại khám phá"/>}<div className="ws-next-strip"><div><strong>Muốn kiểm chứng một hướng?</strong><p>Một thử thách ngắn sẽ cho bạn thêm bằng chứng ngoài phần mô tả nghề.</p></div><Link className="ws-button dark" href="/workspace/quests">Xem thử thách ↗</Link></div></>;
}

function CompareRow({ label, careers: items, value }: { label: string; careers: Career[]; value: (career: Career) => string }) {
  return <tr><th scope="row">{label}</th>{items.map((career) => <td key={career.id}>{value(career)}</td>)}</tr>;
}

function Quests({ state, update }: { state: WorkspaceState; update: (changes: Partial<WorkspaceState>) => void }) {
  const [field, setField] = useState("Tất cả");
  const [selected, setSelected] = useState<Quest | null>(null);
  const [reflection, setReflection] = useState("");
  useEffect(() => {
    if (!selected) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selected]);
  const visible = field === "Tất cả" ? quests : quests.filter((quest) => quest.field === field);
  function completeQuest(quest: Quest) {
    if (!reflection.trim()) return;
    const item: Evidence = { id: crypto.randomUUID(), title: quest.deliverable, skill: quest.skills[0], source: quest.title, reflection: reflection.trim() };
    update({ completedQuests: state.completedQuests.includes(quest.id) ? state.completedQuests : [...state.completedQuests, quest.id], savedQuests: state.savedQuests.filter((id) => id !== quest.id), evidence: [...state.evidence, item] });
    setReflection("");
  }
  return <><SectionTitle eyebrow="03 / CAREER QUEST" title="Thử nghề bằng một bài toán nhỏ" description="Mỗi nhiệm vụ cho bạn thử một phần công việc. Ghi lại điều đã học và đưa bằng chứng vào hồ sơ năng lực."/><div className="ws-filter-row" role="group" aria-label="Lọc thử thách">{["Tất cả", "Dữ liệu", "Truyền thông", "Sản phẩm số"].map((item) => <button type="button" key={item} className={field === item ? "ws-chip selected" : "ws-chip"} aria-pressed={field === item} onClick={() => setField(item)}>{item}</button>)}</div><div className="ws-quest-grid">{visible.map((quest) => <article className="ws-quest-card" key={quest.id}><div className="ws-quest-meta"><span>{quest.field}</span><span>{quest.duration}</span></div><div className="ws-quest-glyph" aria-hidden="true">{quest.field === "Dữ liệu" ? "◌" : quest.field === "Truyền thông" ? "✳" : "▱"}</div><h2>{quest.title}</h2><p>{quest.brief}</p><div className="ws-quest-bottom"><small>{state.completedQuests.includes(quest.id) ? "ĐÃ HOÀN THÀNH" : state.savedQuests.includes(quest.id) ? "ĐÃ LƯU" : quest.source}</small><button type="button" onClick={() => setSelected(quest)} aria-label={`Mở thử thách ${quest.title}`}>Mở thử thách ↗</button></div></article>)}</div><p className="ws-footnote">Các tình huống giúp bạn luyện tập và tự ghi lại kết quả. Hiện chưa có yêu cầu hoặc cơ chế nộp bài từ đối tác.</p>{selected && <div className="ws-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><div className="ws-modal" role="dialog" aria-modal="true" aria-labelledby="ws-quest-title"><button className="ws-modal-close" type="button" aria-label="Đóng thử thách" onClick={() => setSelected(null)}>×</button><p className="ws-eyebrow">CAREER QUEST / {selected.field}</p><h2 id="ws-quest-title">{selected.title}</h2><p>{selected.brief}</p><div className="ws-modal-facts"><div><small>THỜI GIAN GỢI Ý</small><strong>{selected.duration}</strong></div><div><small>ĐẦU RA</small><strong>{selected.deliverable}</strong></div></div><h3>Các bước thực hiện</h3><ol>{selected.steps.map((step) => <li key={step}>{step}</li>)}</ol><div className="ws-modal-actions"><button type="button" className="ws-button outline" onClick={() => update({ savedQuests: toggle(state.savedQuests, selected.id) })}>{state.savedQuests.includes(selected.id) ? "Bỏ lưu" : "Lưu để làm sau"}</button></div><div className="ws-reflection"><h3>Ghi lại điều bạn đã làm</h3><p>Viết một ghi chú ngắn về quá trình thực hiện. Ghi chú sẽ xuất hiện trong hồ sơ của bạn.</p><label htmlFor="quest-reflection">Điều bạn đã thực hiện hoặc học được</label><textarea id="quest-reflection" value={reflection} onChange={(event) => setReflection(event.target.value)} placeholder="Ví dụ: Mình đã thử làm sạch dữ liệu và nhận ra..."/><button type="button" className="ws-button clay" disabled={!reflection.trim()} onClick={() => completeQuest(selected)}>Ghi vào hồ sơ ↗</button>{state.completedQuests.includes(selected.id) && <p className="ws-success" role="status">Đã ghi nhận thử thách này trong hồ sơ của bạn.</p>}</div></div></div>}</>;
}

function Portfolio({ state, update }: { state: WorkspaceState; update: (changes: Partial<WorkspaceState>) => void }) {
  const [goalDraft, setGoalDraft] = useState(state.goal);
  const [editingGoal, setEditingGoal] = useState(false);
  const [title, setTitle] = useState("");
  const [skill, setSkill] = useState("");
  const [source, setSource] = useState("");
  const [reflection, setReflection] = useState("");
  useEffect(() => { setGoalDraft(state.goal); }, [state.goal]);
  function addEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !skill.trim() || !source.trim()) return;
    update({ evidence: [...state.evidence, { id: crypto.randomUUID(), title: title.trim(), skill: skill.trim(), source: source.trim(), reflection: reflection.trim() }] });
    setTitle(""); setSkill(""); setSource(""); setReflection("");
  }
  const skillCount = new Set(state.evidence.map((item) => item.skill.toLowerCase())).size;
  return <><SectionTitle eyebrow="04 / CAREER IDENTITY" title="Hồ sơ lớn lên cùng trải nghiệm" description="Ghi mục tiêu, dự án, sản phẩm và điều bạn đã học. Một kỹ năng trở nên đáng tin hơn khi đi cùng bằng chứng cụ thể."/><div className="ws-profile-banner"><div className="ws-profile-monogram">B</div><div><span>HỒ SƠ NGHỀ NGHIỆP SỐ</span><h2>Hành trình của bạn</h2><p>{state.goal || "Chưa có mục tiêu nghề nghiệp. Hãy viết một hướng bạn muốn khám phá."}</p></div><button type="button" className="ws-button outline" onClick={() => setEditingGoal(!editingGoal)}>{editingGoal ? "Đóng" : "Chỉnh mục tiêu"}</button></div>{editingGoal && <form className="ws-goal-form ws-panel" onSubmit={(event) => { event.preventDefault(); update({ goal: goalDraft.trim() }); setEditingGoal(false); }}><label htmlFor="career-goal">Hướng nghề bạn đang muốn tìm hiểu</label><input id="career-goal" value={goalDraft} onChange={(event) => setGoalDraft(event.target.value)} placeholder="Ví dụ: Kỹ sư dữ liệu"/><button className="ws-button dark" type="submit">Lưu mục tiêu</button></form>}<div className="ws-stats"><div><strong>{state.completedQuests.length}</strong><span>Career Quest hoàn thành</span></div><div><strong>{state.evidence.length}</strong><span>Bằng chứng đã ghi</span></div><div><strong>{skillCount}</strong><span>Kỹ năng có bằng chứng</span></div></div><div className="ws-two-col portfolio-columns"><section><div className="ws-block-heading"><div><p className="ws-eyebrow">BẰNG CHỨNG NĂNG LỰC</p><h2>Việc bạn đã làm</h2></div></div>{state.evidence.length ? <div className="ws-evidence-list">{state.evidence.map((item) => <article key={item.id} className="ws-evidence"><span>{item.skill}</span><h3>{item.title}</h3><p>Nguồn: {item.source}</p>{item.reflection && <blockquote>“{item.reflection}”</blockquote>}<button type="button" onClick={() => update({ evidence: state.evidence.filter((entry) => entry.id !== item.id) })}>Xóa bằng chứng</button></article>)}</div> : <EmptyState title="Chưa có bằng chứng nào" body="Bắt đầu một Career Quest hoặc thêm dự án bạn đã tự thực hiện." href="/workspace/quests" action="Tìm thử thách"/>}</section><section className="ws-panel"><p className="ws-eyebrow">THÊM BẰNG CHỨNG</p><h2>Một việc bạn đã thực hiện</h2><form className="ws-form" onSubmit={addEvidence}><label htmlFor="e-title">Sản phẩm hoặc kết quả</label><input id="e-title" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Bản phân tích dữ liệu bán hàng"/><label htmlFor="e-skill">Kỹ năng đã sử dụng</label><input id="e-skill" required value={skill} onChange={(event) => setSkill(event.target.value)} placeholder="Ví dụ: Phân tích dữ liệu"/><label htmlFor="e-source">Dự án hoặc thử thách</label><input id="e-source" required value={source} onChange={(event) => setSource(event.target.value)} placeholder="Ví dụ: Dự án ở câu lạc bộ"/><label htmlFor="e-reflection">Điều học được (không bắt buộc)</label><textarea id="e-reflection" value={reflection} onChange={(event) => setReflection(event.target.value)} placeholder="Bạn đã giải quyết vấn đề gì?"/><button type="submit" className="ws-button clay">Thêm vào hồ sơ ↗</button></form></section></div><p className="ws-footnote">Bằng chứng bạn tự nhập chưa được cố vấn hoặc đối tác xác thực. Dữ liệu chỉ lưu trên trình duyệt này.</p></>;
}

function Community({ state, update }: { state: WorkspaceState; update: (changes: Partial<WorkspaceState>) => void }) {
  const [category, setCategory] = useState("Tất cả");
  const [compose, setCompose] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postCategory, setPostCategory] = useState("Hỏi về nghề");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const posts = state.posts.filter((post) => category === "Tất cả" || post.category === category);
  function addPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    update({ posts: [{ id: crypto.randomUUID(), title: title.trim(), body: body.trim(), category: postCategory, author: "CARENOVA", likes: 0 }, ...state.posts] });
    setTitle(""); setBody(""); setCompose(false); setCategory("Tất cả");
  }
  function addReply(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    if (!reply.trim()) return;
    update({ replies: { ...state.replies, [id]: [...(state.replies[id] ?? []), reply.trim()] } });
    setReply(""); setReplyTo(null);
  }
  return <><SectionTitle eyebrow="08 / CỘNG ĐỒNG NGHỀ NGHIỆP" title="Hỏi, chia sẻ, rồi cùng hành động" description="Đặt câu hỏi về nghề, chia sẻ kinh nghiệm và tìm người cùng thử sức. Khi đã có trải nghiệm, bạn cũng có thể giúp người đi sau."/><div className="ws-community-layout"><div><div className="ws-community-tools"><div className="ws-filter-row" role="group" aria-label="Lọc bài viết">{["Tất cả", "Hỏi về nghề", "Chia sẻ kinh nghiệm", "Tìm đồng đội"].map((item) => <button type="button" key={item} className={category === item ? "ws-chip selected" : "ws-chip"} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>)}</div><button className="ws-button dark" type="button" onClick={() => setCompose(!compose)}>{compose ? "Đóng" : "Viết bài ↗"}</button></div>{compose && <form className="ws-panel ws-compose" onSubmit={addPost}><h2>Chia sẻ với cộng đồng</h2><label htmlFor="post-kind">Chủ đề</label><select id="post-kind" value={postCategory} onChange={(event) => setPostCategory(event.target.value)}><option>Hỏi về nghề</option><option>Chia sẻ kinh nghiệm</option><option>Tìm đồng đội</option></select><label htmlFor="post-title">Tiêu đề</label><input id="post-title" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Bạn muốn hỏi hoặc chia sẻ điều gì?"/><label htmlFor="post-body">Nội dung</label><textarea id="post-body" required value={body} onChange={(event) => setBody(event.target.value)} placeholder="Viết cụ thể để mọi người dễ góp ý..."/><button className="ws-button clay" type="submit">Đăng bài ↗</button></form>}<div className="ws-post-list">{posts.length === 0 && <div className="ws-empty"><span aria-hidden="true">✳</span><h3>Chưa có bài viết trong cộng đồng</h3><p>Đặt câu hỏi đầu tiên về một nghề bạn quan tâm hoặc chia sẻ điều đã học được từ Career Quest.</p><button type="button" className="ws-button dark" onClick={() => setCompose(true)}>Viết bài đầu tiên</button></div>}{posts.map((post) => <article key={post.id} className="ws-post"><div className="ws-post-top"><span>{post.category}</span><small>{post.author}</small></div><h2>{post.title}</h2><p>{post.body}</p><div className="ws-post-actions"><button type="button" aria-pressed={state.likedPosts.includes(post.id)} onClick={() => update({ likedPosts: toggle(state.likedPosts, post.id) })}>{state.likedPosts.includes(post.id) ? "Đã hữu ích" : "Hữu ích"} · {post.likes + (state.likedPosts.includes(post.id) ? 1 : 0)}</button><button type="button" onClick={() => setReplyTo(replyTo === post.id ? null : post.id)}>Phản hồi · {state.replies[post.id]?.length ?? 0}</button></div>{state.replies[post.id]?.map((item, index) => <div className="ws-reply" key={`${post.id}-${index}`}><strong>CARENOVA</strong><p>{item}</p></div>)}{replyTo === post.id && <form className="ws-reply-form" onSubmit={(event) => addReply(event, post.id)}><label className="sr-only" htmlFor={`reply-${post.id}`}>Phản hồi bài viết</label><input id={`reply-${post.id}`} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Viết phản hồi của bạn..."/><button type="submit" disabled={!reply.trim()}>Gửi</button></form>}</article>)}</div></div><aside className="ws-community-side"><div className="ws-panel"><p className="ws-eyebrow">VÒNG LẶP ĐÓNG GÓP</p><h2>Từ người học đến người đồng hành</h2><ol><li>Học từ câu hỏi</li><li>Thử một trải nghiệm</li><li>Chia sẻ điều đã làm</li><li>Hỗ trợ người đi sau</li></ol></div><div className="ws-note"><strong>Đóng góp của bạn</strong><p>{state.posts.length} bài đã chia sẻ · {state.likedPosts.length} nội dung thấy hữu ích.</p></div></aside></div><p className="ws-footnote">Bài viết và phản hồi được lưu trên trình duyệt này. Chỉ bạn nhìn thấy nội dung cho đến khi hệ thống tài khoản và cộng đồng được kết nối.</p></>;
}
