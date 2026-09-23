"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { Career } from "./data";

type DiscoveryProfile = {
  audience: "student" | "school";
  interest: string;
  strength: string;
  value: string;
  currentSkills: string[];
  discoveryCompleted: boolean;
};

type DiscoveryProps = {
  careers: Career[];
  profile: DiscoveryProfile;
  update: (changes: Partial<DiscoveryProfile>) => void;
};

const prompts = [
  { question: "Bạn đang ở chặng nào của hành trình?", detail: "CARIO dùng điều này để gợi ý bước thử phù hợp, không để xếp loại bạn.", options: ["Học sinh THPT", "Sinh viên"] },
  { question: "Bạn muốn hiểu rõ nhóm nghề nào trước?", detail: "Chọn lĩnh vực bạn sẵn lòng thử, không cần là quyết định cuối cùng.", options: ["Dữ liệu", "Công nghệ", "Thiết kế", "Truyền thông", "Bảo mật", "Kinh doanh", "Tài chính", "Giáo dục", "Xã hội", "Kiến trúc", "Vận hành", "Pháp luật", "Môi trường"] },
  { question: "Khi làm việc cùng người khác, bạn thường đóng góp theo cách nào?", detail: "Chọn điều gần với trải nghiệm của bạn nhất; có thể khám phá lại bất cứ lúc nào.", options: ["Phân tích", "Sáng tạo", "Giao tiếp", "Tổ chức công việc"] },
  { question: "Bạn muốn một công việc đem lại điều gì?", detail: "Giá trị cá nhân giúp CARIO gợi ý môi trường và trải nghiệm đáng thử.", options: ["Học điều mới", "Tạo ích lợi cho cộng đồng", "Giải quyết vấn đề", "Làm việc cùng người khác"] },
  { question: "Bạn đã từng thực hành kỹ năng nào?", detail: "Chọn nhiều kỹ năng đã thực sự dùng. Bạn có thể tìm trong danh sách của các nghề và cập nhật sau.", options: [] },
] as const;

function normalize(text: string): string {
  return text.toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
}

export default function Discover({ careers, profile, update }: DiscoveryProps) {
  const [step, setStep] = useState(profile.discoveryCompleted ? prompts.length : 0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>(profile.currentSkills);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const latestMessage = useRef<HTMLDivElement>(null);
  const complete = step === prompts.length;
  const suggested = careers.filter((career) => career.group === profile.interest);
  const skillCatalog = Array.from(new Set(careers.flatMap((career) => [...career.skills, ...career.nextSkills]))).sort((a, b) => a.localeCompare(b, "vi"));
  const relevantSkills = new Set(suggested.flatMap((career) => [...career.skills, ...career.nextSkills]));
  const visibleSkills = skillCatalog.filter((skill) => showAllSkills || relevantSkills.has(skill) || skills.includes(skill)).filter((skill) => !draft || normalize(skill).includes(normalize(draft)));

  useEffect(() => {
    if (step > 0 && answers.length > 0) latestMessage.current?.scrollIntoView({ block: "center" });
  }, [step, answers.length]);

  function answer(option: string) {
    if (step === 0) update({ audience: option === "Học sinh THPT" ? "school" : "student" });
    if (step === 1) update({ interest: option });
    if (step === 2) update({ strength: option === "Mình chưa rõ" ? "" : option });
    if (step === 3) update({ value: option === "Mình chưa rõ" ? "" : option });
    setAnswers((current) => [...current, option]);
    setDraft("");
    setError("");
    setStep((current) => current + 1);
  }

  function finish(selected: string[]) {
    update({ currentSkills: selected, discoveryCompleted: true });
    setAnswers((current) => [...current, selected.length ? selected.join(" · ") : "Mình sẽ bổ sung sau"]);
    setDraft("");
    setError("");
    setStep(prompts.length);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (complete) return;
    if (step === 4) {
      const entered = normalize(draft);
      const matches = skillCatalog.filter((option) => entered.split(",").some((part) => normalize(part) === normalize(option)));
      if (draft.trim() && matches.length === 0) {
        setError("Mình chưa nhận ra kỹ năng đó. Hãy chọn từ danh sách hoặc nhập đúng tên kỹ năng, ngăn cách bằng dấu phẩy.");
        return;
      }
      finish([...new Set([...skills, ...matches])]);
      return;
    }
    const entered = normalize(draft);
    const match = prompts[step].options.find((option) => entered === normalize(option) || entered.includes(normalize(option)));
    if (!match) {
      setError("Hãy chọn một gợi ý bên trên hoặc nhập đúng tên lựa chọn để tiếp tục.");
      return;
    }
    answer(match);
  }

  function restart() {
    update({ discoveryCompleted: false });
    setStep(0);
    setAnswers([]);
    setSkills(profile.currentSkills);
    setShowAllSkills(false);
    setDraft("");
    setError("");
    window.scrollTo(0, 0);
  }

  return <section className="ws-discovery-page" aria-labelledby="discovery-title">
    <div className="ws-discovery-toolbar"><span className="ws-eyebrow">CARIO / KHÁM PHÁ BẢN THÂN</span><span>{complete ? "HOÀN THÀNH" : `CÂU HỎI 0${step + 1} / 0${prompts.length}`}</span></div>
    <div className="ws-discovery-progress" aria-hidden="true"><span style={{ width: `${(step / prompts.length) * 100}%` }} /></div>
    <div className="ws-discovery-thread">
      <div className="ws-discovery-intro"><span className="ws-coach-symbol" aria-hidden="true">✳</span><h1 id="discovery-title">{complete && answers.length === 0 ? <>Điều bạn đã chọn<br />cho hành trình này.</> : <>Bắt đầu từ điều<br />bạn biết về mình.</>}</h1><p>{complete && answers.length === 0 ? "Các câu trả lời của bạn đã được lưu trên trình duyệt này. Bạn có thể khám phá lại bất cứ lúc nào." : "Một vài câu hỏi ngắn sẽ giúp bạn tìm ra hướng nên thử tiếp theo."}</p></div>
      {answers.map((item, index) => <div className="ws-discovery-exchange" key={prompts[index].question}><div className="ws-discovery-question-past"><span>CARIO</span><p>{prompts[index].question}</p></div><div className="ws-discovery-answer"><span>Bạn</span><p>{item}</p></div></div>)}
      {complete ? <div className="ws-discovery-finish" ref={latestMessage} aria-live="polite"><span className="ws-discovery-avatar" aria-hidden="true">✳</span><div><p className="ws-eyebrow">GỢI Ý TỪ CARIO</p><h2>Một điểm bắt đầu, chưa phải kết luận.</h2><p>Bạn đang quan tâm đến <strong>{profile.interest}</strong>{profile.strength && <>, nhận thấy mình có thế mạnh <strong>{profile.strength.toLocaleLowerCase("vi")}</strong></>}{profile.value && <> và coi trọng việc <strong>{profile.value.toLocaleLowerCase("vi")}</strong></>}. Hãy thử một công việc nhỏ trước khi chọn hướng đi dài hơn.</p>{suggested.length > 0 ? <div className="ws-discovery-next"><span>HƯỚNG CÓ THỂ TÌM HIỂU</span>{suggested.map((career) => <div key={career.id}><h3>{career.title}</h3><p>{career.description}</p></div>)}<Link className="ws-link" href="/workspace/compare">So sánh các hướng nghề →</Link></div> : <div className="ws-discovery-next"><span>BƯỚC TIẾP THEO</span><p>Chưa có nghề trong danh sách thuộc lĩnh vực này. Hãy bắt đầu bằng một thử thách để hiểu rõ hơn điều khiến bạn hứng thú.</p><Link className="ws-link" href="/workspace/quests">Xem thử thách nghề →</Link></div>}</div></div> : <div className="ws-discovery-current" ref={latestMessage} aria-live="polite"><span className="ws-discovery-avatar" aria-hidden="true">✳</span><div className="ws-discovery-prompt"><span>CARIO</span><h2>{prompts[step].question}</h2><p>{prompts[step].detail}</p>{step === 4 && <div className="ws-skill-tools"><p>{skills.length} kỹ năng đã chọn · {skillCatalog.length} kỹ năng trong danh sách</p><button type="button" onClick={() => setShowAllSkills((value) => !value)}>{showAllSkills ? "Chỉ xem lĩnh vực đã chọn" : "Xem tất cả lĩnh vực"}</button></div>}<div className="ws-discovery-options ws-skill-options">{(step === 4 ? visibleSkills : prompts[step].options).map((option) => <button type="button" key={option} className={step === 4 && skills.includes(option) ? "selected" : ""} aria-pressed={step === 4 ? skills.includes(option) : undefined} onClick={() => step === 4 ? setSkills((current) => current.includes(option) ? current.filter((skill) => skill !== option) : [...current, option]) : answer(option)}>{option}</button>)}</div>{step === 4 && visibleSkills.length === 0 && <p>Không có kỹ năng phù hợp. Thử tìm tên khác hoặc xem tất cả lĩnh vực.</p>}{step === 4 ? <div className="ws-discovery-prompt-actions"><button type="button" className="ws-button dark" onClick={() => finish(skills)}>Lưu kỹ năng và xem kết quả ↗</button><button type="button" onClick={() => finish([])}>Chưa có kỹ năng nào</button></div> : step === 2 || step === 3 ? <button type="button" className="ws-discovery-skip" onClick={() => answer("Mình chưa rõ")}>Mình chưa rõ →</button> : null}</div></div>}
    </div>
    <div className="ws-discovery-entry">{complete ? <button type="button" className="ws-discovery-restart" onClick={restart}>Khám phá lại từ đầu ↗</button> : <><form className="ws-coach-composer" onSubmit={submit}><label className="sr-only" htmlFor="discovery-draft">Câu trả lời của bạn</label><input id="discovery-draft" value={draft} onChange={(event) => { setDraft(event.target.value); setError(""); }} placeholder={step === 4 ? "Tìm kỹ năng hoặc nhập tên, ngăn cách bằng dấu phẩy..." : "Chọn gợi ý hoặc nhập câu trả lời..."} /><button type="submit" aria-label="Gửi câu trả lời" disabled={!draft.trim() && !(step === 4 && skills.length > 0)}>↑</button></form>{error && <p className="ws-discovery-error" role="alert">{error}</p>}<p>Câu trả lời được đồng bộ với hồ sơ CARIO khi kết nối API sẵn sàng.</p></>}</div>
  </section>;
}
