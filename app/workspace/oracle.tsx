"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const AXES = [
  { key: "logic", label: "Tư duy logic", short: "Logic", note: "Bạn có xu hướng tìm cấu trúc, kiểm tra dữ kiện và cân nhắc bằng chứng." },
  { key: "creativity", label: "Sáng tạo", short: "Sáng tạo", note: "Bạn hay tìm cách diễn đạt hoặc thử một phương án mới." },
  { key: "empathy", label: "Đồng cảm", short: "Đồng cảm", note: "Bạn chú ý tới trải nghiệm và nhu cầu của người liên quan." },
  { key: "leadership", label: "Dẫn dắt", short: "Dẫn dắt", note: "Bạn quan tâm việc xác định ưu tiên và giúp nhóm tiến về phía trước." },
  { key: "curiosity", label: "Tò mò học hỏi", short: "Tò mò", note: "Bạn muốn hiểu thêm trước khi kết luận hoặc bắt tay làm." },
  { key: "collaboration", label: "Hợp tác", short: "Hợp tác", note: "Bạn có xu hướng kết nối góc nhìn và làm việc cùng người khác." },
] as const;
type AxisKey = (typeof AXES)[number]["key"];
type OracleAnalysis = { overview: string; observations: string[]; next_experiments: string[]; reflection_questions: string[] };
type OracleResult = { attempt_id: string; version: number; scores: Record<AxisKey, number>; completed_at: string; analysis?: OracleAnalysis };
type OracleQuestion = { key: string; order: number; chapter: string; scenario: string; prompt: string; options: { id: string; text: string }[] };
type Catalog = { version: number; questions: OracleQuestion[] };
type Draft = { version: number; answers: { question_key: string; option_id: string }[] };

function token(): string | null {
  try { return JSON.parse(localStorage.getItem("cario-auth") || "null")?.token ?? null; } catch { return null; }
}

async function oracleApi<T>(path: string, init?: RequestInit): Promise<T> {
  const authToken = token();
  if (!authToken) throw new Error("Bạn cần đăng nhập để dùng Oracle.");
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/v1/oracle${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}`, ...init?.headers },
    });
  } catch {
    throw new Error("Không kết nối được Oracle. Hãy kiểm tra FastAPI ở cổng 8000 rồi thử lại.");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(typeof body?.detail === "string" ? body.detail : "Oracle chưa thể tải dữ liệu lúc này.");
  }
  return response.json() as Promise<T>;
}

function dateLabel(date: string): string {
  const value = new Date(date);
  return Number.isNaN(value.getTime()) ? "Vừa hoàn thành" : new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "long", year: "numeric" }).format(value);
}

function Radar({ scores }: { scores: Record<AxisKey, number> }) {
  const axisMax = Math.max(30, Math.ceil(Math.max(...Object.values(scores)) / 10) * 10);
  const point = (index: number, radius: number) => {
    const angle = -Math.PI / 2 + index * Math.PI / 3;
    return `${160 + Math.cos(angle) * radius},${160 + Math.sin(angle) * radius}`;
  };
  const polygon = (scale: number) => AXES.map((_, index) => point(index, 104 * scale)).join(" ");
  const result = AXES.map((axis, index) => point(index, 104 * Math.max(0, Math.min(axisMax, scores[axis.key])) / axisMax)).join(" ");
  return <svg className="ws-oracle-radar" viewBox="0 0 320 320" role="img" aria-label={`Tỷ trọng Oracle, tổng 100 phần trăm: ${AXES.map((axis) => `${axis.label} ${scores[axis.key]} phần trăm`).join(", ")}`}>
    {[0.25, 0.5, 0.75, 1].map((scale) => <polygon key={scale} points={polygon(scale)} fill="none" stroke="#d5d0c5" strokeWidth="1" />)}
    {AXES.map((_, index) => <line key={index} x1="160" y1="160" x2={point(index, 104).split(",")[0]} y2={point(index, 104).split(",")[1]} stroke="#d5d0c5" strokeWidth="1" />)}
    <polygon points={result} fill="rgba(91, 119, 96, .25)" stroke="#506d55" strokeWidth="2.5" />
    {AXES.map((axis, index) => {
      const [x, y] = point(index, 126).split(",").map(Number);
      return <text key={axis.key} x={x} y={y} textAnchor={x < 150 ? "end" : x > 170 ? "start" : "middle"} dominantBaseline="middle">{axis.short}</text>;
    })}
    <text x="160" y="307" textAnchor="middle">Vòng ngoài = {axisMax}%</text>
  </svg>;
}

function OracleCoverArt() {
  return <svg className="ws-oracle-cover-art" viewBox="0 0 420 310" aria-hidden="true" focusable="false">
    <defs><pattern id="oracle-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#738d77" strokeWidth=".5" opacity=".36" /></pattern></defs>
    <rect width="420" height="310" rx="22" fill="url(#oracle-grid)" />
    <path d="M49 218C113 218 113 77 205 77S307 146 369 69M49 218C128 218 142 255 209 219S300 219 369 259M205 77C232 128 263 156 369 158" fill="none" stroke="#d9e7d5" strokeWidth="2" opacity=".75" />
    <path d="M49 218C113 218 113 77 205 77S307 146 369 69" fill="none" stroke="#d9e7d5" strokeWidth="7" opacity=".17" />
    {[[49,218],[205,77],[369,69],[209,219],[369,259],[369,158]].map(([x,y], index) => <g key={index}><circle cx={x} cy={y} r="15" fill="#d7c59d" /><circle cx={x} cy={y} r="5" fill="#294534" /></g>)}
    <circle cx="209" cy="155" r="43" fill="#e8e3d4" /><path d="M209 125v60m-30-30h60m-51-21 42 42m0-42-42 42" stroke="#294534" strokeWidth="2" />
    <text x="27" y="37">MỖI LỰA CHỌN MỞ MỘT HƯỚNG</text>
    <text x="302" y="296">ORACLE / CARIO</text>
  </svg>;
}

function Result({ result, onRetake, onAnalyze, analyzing, analysisError }: { result: OracleResult; onRetake?: () => void; onAnalyze: () => void; analyzing: boolean; analysisError: string }) {
  const ranking = [...AXES].sort((a, b) => result.scores[b.key] - result.scores[a.key]);
  return <div className="ws-oracle-result">
    <div className="ws-oracle-result-header"><div><p className="ws-eyebrow">VECTOR / 6 CHIỀU</p><h2>Những xu hướng bạn đã thể hiện</h2><p>Hoàn thành ngày {dateLabel(result.completed_at)}. Sáu tỷ trọng cộng đúng 100%; đây là cách bạn phân bổ lựa chọn trong tình huống giả định, không phải điểm năng lực.</p></div><span className="ws-oracle-version">Bộ câu hỏi v{result.version}</span></div>
    <div className="ws-oracle-result-grid"><div className="ws-oracle-chart"><Radar scores={result.scores} /></div><div className="ws-oracle-axis-list">{AXES.map((axis) => <div className="ws-oracle-axis" key={axis.key}><div><strong>{axis.label}</strong><span>{result.scores[axis.key]}%</span></div><div className="ws-oracle-axis-track"><span style={{ width: `${result.scores[axis.key]}%` }} /></div></div>)}<p className="ws-oracle-score-total">Tổng 6 chiều <strong>{Object.values(result.scores).reduce((sum, value) => sum + value, 0)}%</strong></p></div></div>
    <div className="ws-oracle-reading"><strong>Đọc kết quả</strong><p>{ranking[0].note} {ranking[1].note} Tỷ trọng thấp không có nghĩa là điểm yếu. Hãy kiểm chứng những xu hướng này bằng dự án và phản hồi từ người khác.</p></div>
    <section className="ws-oracle-ai" aria-labelledby="oracle-ai-title"><div className="ws-oracle-ai-head"><div><p className="ws-eyebrow">GÓC NHÌN BỔ SUNG</p><h3 id="oracle-ai-title">Coach đọc cùng bạn</h3></div><span aria-hidden="true">✳</span></div>{result.analysis ? <div className="ws-oracle-ai-content"><p className="ws-oracle-ai-overview">{result.analysis.overview}</p><div className="ws-oracle-ai-columns"><div><h4>Điều thể hiện qua lựa chọn</h4><ul>{result.analysis.observations.map((item, index) => <li key={index}>{item}</li>)}</ul></div><div><h4>Thử tiếp trong đời thật</h4><ul>{result.analysis.next_experiments.map((item, index) => <li key={index}>{item}</li>)}</ul></div></div>{result.analysis.reflection_questions.length > 0 && <div className="ws-oracle-ai-questions"><h4>Câu hỏi để tự ngẫm</h4><ul>{result.analysis.reflection_questions.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}<small>Nhận xét AI đã lưu với bài làm này. Mở lại sẽ không phân tích lại.</small></div> : <div className="ws-oracle-ai-intro"><p>Muốn đi xa hơn con số? Coach sẽ nhìn vào những lựa chọn cụ thể của bạn để gợi ý điều đáng thử, rồi lưu nhận xét vào hồ sơ. Mỗi bài chỉ phân tích một lần.</p><button type="button" className="ws-button dark" disabled={analyzing} onClick={onAnalyze}>{analyzing ? "Đang đọc lựa chọn…" : "Nhận phân tích từ Coach"}</button>{analyzing && <p role="status">Coach đang phân tích lựa chọn của bạn. Kết quả sẽ được lưu khi hoàn tất…</p>}</div>}{analysisError && <p className="ws-file-error" role="alert">{analysisError}</p>}</section>
    <div className="ws-oracle-result-actions"><Link className="ws-button dark" href="/workspace/portfolio">Xem trong hồ sơ</Link>{onRetake && <button type="button" className="ws-button outline" onClick={onRetake}>Làm lại tình huống</button>}</div>
  </div>;
}

export function OracleProfileCard() {
  const [result, setResult] = useState<OracleResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    oracleApi<{ result: OracleResult | null }>("/result")
      .then((data) => setResult(data.result))
      .catch(() => setError("Chưa tải được kết quả Oracle. Hãy mở trang Oracle để thử lại."))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="ws-oracle-profile-card" role="status">Đang tải Oracle…</div>;
  if (error) return <div className="ws-oracle-profile-card" role="status">{error} <Link className="ws-link" href="/workspace/oracle">Mở Oracle</Link></div>;
  const top = result ? [...AXES].sort((a, b) => result.scores[b.key] - result.scores[a.key]).slice(0, 2) : [];
  return <section className="ws-oracle-profile-card" aria-labelledby="oracle-profile-title"><div className="ws-oracle-profile-mark" aria-hidden="true">✳</div><div><p className="ws-eyebrow">ORACLE / KHÁM PHÁ QUA TÌNH HUỐNG</p><h2 id="oracle-profile-title">{result ? "Vector lựa chọn của bạn" : "Bạn muốn hoàn thiện hồ sơ?"}</h2><p>{result ? `Hai tỷ trọng nổi bật: ${top.map((axis) => axis.label).join(" và ")}. Cả sáu chiều cộng 100%, không phải điểm năng lực.` : "Thử 18 tình huống ngắn để nhìn rõ cách bạn suy nghĩ, phối hợp và giải quyết vấn đề."}</p>{result && <div className="ws-oracle-profile-vector" role="group" aria-label="Tỷ trọng sáu chiều Oracle">{AXES.map((axis) => <div key={axis.key}><span>{axis.short}</span><div><span style={{ width: `${result.scores[axis.key]}%` }} /></div><strong>{result.scores[axis.key]}%</strong></div>)}</div>}{result?.analysis && <p className="ws-oracle-profile-insight">Coach nhận xét: {result.analysis.overview}</p>}<Link className="ws-link" href="/workspace/oracle">{result ? "Xem kết quả Oracle" : "Bắt đầu với Oracle"} →</Link></div></section>;
}

export default function Oracle() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<OracleResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      oracleApi<Catalog>("/questions"),
      oracleApi<Draft>("/draft"),
      oracleApi<{ result: OracleResult | null }>("/result"),
    ]).then(([questions, draft, latest]) => {
      setCatalog(questions);
      setResult(latest.result);
      if (draft.version === questions.version && draft.answers.length > 0) {
        const saved = Object.fromEntries(draft.answers.map((answer) => [answer.question_key, answer.option_id]));
        setAnswers(saved);
        const first = questions.questions.findIndex((question) => !saved[question.key]);
        setIndex(first >= 0 ? first : questions.questions.length - 1);
        setStarted(true);
      }
    }).catch((cause) => setError(cause.message)).finally(() => setLoading(false));
  }, []);

  async function choose(optionId: string) {
    if (!catalog || saving) return;
    const current = catalog.questions[index];
    const updated = { ...answers, [current.key]: optionId };
    setSaving(true); setError("");
    try {
      await oracleApi<Draft>("/draft", { method: "PUT", body: JSON.stringify({ version: catalog.version, answers: Object.entries(updated).map(([question_key, option_id]) => ({ question_key, option_id })) }) });
      setAnswers(updated);
    } catch (cause) { setError((cause as Error).message); }
    finally { setSaving(false); }
  }
  async function finish() {
    if (!catalog || finishing) return;
    setFinishing(true); setError("");
    try {
      const completed = await oracleApi<OracleResult>("/complete", { method: "POST", body: JSON.stringify({ version: catalog.version, answers: catalog.questions.map((question) => ({ question_key: question.key, option_id: answers[question.key] })) }) });
      setResult(completed); setStarted(false); setAnswers({}); setAnalysisError("");
    } catch (cause) { setError((cause as Error).message); }
    finally { setFinishing(false); }
  }
  async function retake() {
    if (!catalog) return;
    setSaving(true); setError("");
    try {
      await oracleApi<Draft>("/draft", { method: "PUT", body: JSON.stringify({ version: catalog.version, answers: [] }) });
      setAnswers({}); setIndex(0); setStarted(true);
    } catch (cause) { setError((cause as Error).message); }
    finally { setSaving(false); }
  }

  async function analyze() {
    if (!result || analyzing || result.analysis) return;
    setAnalyzing(true); setAnalysisError("");
    try {
      const response = await oracleApi<{ analysis: OracleAnalysis; cached: boolean }>("/analysis", { method: "POST" });
      setResult((current) => current ? { ...current, analysis: response.analysis } : current);
    } catch (cause) { setAnalysisError((cause as Error).message); }
    finally { setAnalyzing(false); }
  }

  const question = catalog?.questions[index];
  return <section className="ws-oracle-page"><div className="ws-oracle-cover"><div className="ws-oracle-heading"><p className="ws-oracle-kicker">Oracle <span>/</span> bản đồ lựa chọn</p><h1>Thử một quyết định. Hiểu thêm một điều về mình.</h1><p>18 tình huống gần với đời sống dự án. Chọn cách bạn có khả năng làm nhất; không có phương án đúng cho tất cả mọi người.</p></div><OracleCoverArt /></div>{error && <div className="ws-oracle-error" role="alert"><p>{error}</p>{!catalog && <button type="button" className="ws-button outline" onClick={() => window.location.reload()}>Tải lại Oracle</button>}</div>}{loading && <p role="status">Đang tải tình huống Oracle…</p>}
    {!loading && catalog && !started && (result ? <Result result={result} onRetake={() => void retake()} onAnalyze={() => void analyze()} analyzing={analyzing} analysisError={analysisError} /> : <div className="ws-oracle-welcome"><div><h2>18 tình huống, 6 góc nhìn</h2><p>Bạn sẽ gặp những quyết định về dữ liệu, sản phẩm, làm việc nhóm và cộng đồng. Kết quả là sáu tỷ trọng cộng 100% trong hồ sơ của bạn.</p></div><button type="button" className="ws-button dark" onClick={() => setStarted(true)}>Bắt đầu khám phá</button></div>)}
    {!loading && catalog && started && question && <div className="ws-oracle-flow"><div className="ws-oracle-progress"><span>Tình huống {index + 1} / {catalog.questions.length}</span><span>{Math.round(Object.keys(answers).length / catalog.questions.length * 100)}% đã trả lời</span><div><span style={{ width: `${(index + 1) / catalog.questions.length * 100}%` }} /></div></div><div className="ws-oracle-scene"><span>{question.chapter}</span><p>{question.scenario}</p><h2>{question.prompt}</h2></div><fieldset className="ws-oracle-options" disabled={saving}><legend className="sr-only">Chọn cách bạn sẽ làm</legend>{question.options.map((option) => <label key={option.id} className={answers[question.key] === option.id ? "selected" : ""}><input type="radio" name={question.key} value={option.id} checked={answers[question.key] === option.id} onChange={() => void choose(option.id)} /><span className="ws-oracle-option-letter">{option.id}</span><span>{option.text}</span></label>)}</fieldset><div className="ws-oracle-flow-actions"><button type="button" disabled={index === 0 || saving} onClick={() => setIndex((current) => current - 1)}>Quay lại</button>{index < catalog.questions.length - 1 ? <button type="button" className="ws-button dark" disabled={!answers[question.key] || saving} onClick={() => setIndex((current) => current + 1)}>Tiếp tục</button> : <button type="button" className="ws-button dark" disabled={Object.keys(answers).length !== catalog.questions.length || saving || finishing} onClick={() => void finish()}>{finishing ? "Đang phân tích…" : "Xem vector của tôi"}</button>}</div><p className="ws-oracle-flow-note">Lựa chọn được lưu vào tài khoản sau mỗi câu. Bạn có thể quay lại hoàn thành sau.</p></div>}
  </section>;
}
