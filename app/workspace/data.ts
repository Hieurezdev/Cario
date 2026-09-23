export type Career = {
  id: string;
  title: string;
  group: string;
  description: string;
  skills: string[];
  nextSkills: string[];
  tryThis: string;
  path: string;
  mentor: string;
};

export type Evidence = { id: string; title: string; skill: string; source: string; reflection: string };

export const sectionSlugs = ["discover", "compare", "quests", "portfolio", "cv", "coach", "connections", "community"] as const;
export type SectionSlug = (typeof sectionSlugs)[number];

export const teamMembers = [
  "Hoàng Chí Hiển",
  "Nguyễn Phạm Trung Hiếu",
  "Phạm Quang Toản",
  "Bùi Mai Trang",
] as const;

export type Quest = {
  id: string;
  title: string;
  field: string;
  source: string;
  duration: string;
  brief: string;
  deliverable: string;
  steps: string[];
  skills: string[];
};

export const quests: Quest[] = [
  { id: "coop-data", title: "Đọc dữ liệu bán hàng cho hợp tác xã", field: "Dữ liệu", source: "Tình huống thực hành · Hợp tác xã", duration: "3–4 giờ", brief: "Một hợp tác xã muốn biết sản phẩm nào bán tốt theo mùa và nên theo dõi chỉ số gì trong tháng tới.", deliverable: "Một trang phân tích cùng 2 đề xuất hành động", steps: ["Làm sạch bảng dữ liệu thực hành", "Tìm xu hướng và ngoại lệ", "Giải thích kết quả cho người không chuyên"], skills: ["SQL", "Phân tích dữ liệu", "Trình bày insight"] },
  { id: "local-story", title: "Kể chuyện cho một sản phẩm địa phương", field: "Truyền thông", source: "Tình huống thực hành · Sản phẩm địa phương", duration: "2–3 giờ", brief: "Một sản phẩm mới cần thông điệp ngắn, rõ và gần gũi với nhóm khách hàng trẻ.", deliverable: "Thông điệp, kênh và một bản nội dung", steps: ["Xác định người xem", "Chọn câu chuyện cốt lõi", "Viết và giải thích một bản nội dung"], skills: ["Nghiên cứu", "Viết nội dung", "Giao tiếp"] },
  { id: "website", title: "Phác thảo website cho tổ chức cộng đồng", field: "Sản phẩm số", source: "Tình huống thực hành · Tổ chức cộng đồng", duration: "4–5 giờ", brief: "Một tổ chức cần trang web để người mới hiểu hoạt động và biết cách tham gia.", deliverable: "Sơ đồ nội dung và bản phác thảo trang chủ", steps: ["Xác định nhu cầu của người xem", "Sắp xếp nội dung chính", "Phác thảo và giải thích luồng tham gia"], skills: ["Thiết kế giao diện", "Tư duy hệ thống", "Giao tiếp"] },
];
