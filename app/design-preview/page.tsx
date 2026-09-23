import Coach from "../workspace/coach";
import CommunityPage from "../workspace/community";
import "../workspace/workspace.css";

export default function DesignPreview() {
  return <div className="workspace"><main className="ws-content"><Coach interest="Dữ liệu" goal="" evidenceCount={0} /><div style={{ height: 80 }} /><CommunityPage /></main></div>;
}
