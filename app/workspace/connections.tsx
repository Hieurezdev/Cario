"use client";

import Link from "next/link";
import { useState } from "react";
import { teamMembers } from "./data";

export default function Connections({ interest }: { interest: string }) {
  const [field, setField] = useState(interest);
  return <>
    <div className="ws-title"><p className="ws-eyebrow">07 / CONNECTOR</p><h1>Kết nối bắt đầu từ một hướng bạn muốn tìm hiểu</h1><p>Chọn lĩnh vực quan tâm để theo dõi cố vấn và cơ hội khi được công bố. Trong lúc này, hãy chuẩn bị câu hỏi và bằng chứng năng lực của bạn.</p></div>
    <div className="ws-filter-row" role="group" aria-label="Lĩnh vực quan tâm">{["Dữ liệu", "Công nghệ", "Thiết kế", "Bảo mật", "Truyền thông"].map((item) => <button type="button" key={item} className={field === item ? "ws-chip selected" : "ws-chip"} aria-pressed={field === item} onClick={() => setField(item)}>{item}</button>)}</div>
    <div className="ws-connection-layout">
      <section className="ws-connection-availability"><div className="ws-connection-section"><p className="ws-eyebrow">CỐ VẤN / {field.toUpperCase()}</p><h2>Chưa có cố vấn được xác nhận</h2><p>Danh sách cố vấn sẽ xuất hiện tại đây khi người tham gia và lĩnh vực hỗ trợ được xác nhận.</p><Link className="ws-link" href="/workspace/coach">Chuẩn bị câu hỏi với Career Coach →</Link></div><div className="ws-connection-section"><p className="ws-eyebrow">CƠ HỘI / {field.toUpperCase()}</p><h2>Chưa có cơ hội được công bố</h2><p>Bạn có thể thử một Career Quest và ghi lại sản phẩm đã làm để sẵn sàng khi có dự án phù hợp.</p><Link className="ws-link" href="/workspace/quests">Khám phá Career Quest →</Link></div></section>
      <aside className="ws-connection-side"><div className="ws-panel"><p className="ws-eyebrow">TRƯỚC KHI KẾT NỐI</p><h2>Chuẩn bị một câu chuyện cụ thể</h2><ol><li>Chọn hướng nghề bạn muốn hỏi.</li><li>Ghi lại một dự án hoặc việc đã thử.</li><li>Viết câu hỏi mà bạn cần người đi trước góp ý.</li></ol><Link className="ws-link" href="/workspace/portfolio">Mở hồ sơ năng lực →</Link></div><div className="ws-team-panel"><p className="ws-eyebrow">NHÓM PHÁT TRIỂN CARIO</p><h3>CARENOVA · PTIT Hà Nội</h3><ul>{teamMembers.map((name) => <li key={name}>{name}</li>)}</ul></div></aside>
    </div>
  </>;
}
