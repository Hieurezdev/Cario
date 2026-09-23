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

export const careers: Career[] = [
  { id: "ai", title: "Kỹ sư AI", group: "Công nghệ", description: "Xây dựng và đánh giá hệ thống học máy để giải quyết một bài toán cụ thể.", skills: ["Python", "Phân tích dữ liệu", "Tư duy thử nghiệm"], nextSkills: ["Mô hình học máy", "Đánh giá mô hình"], tryThis: "Huấn luyện một mô hình nhỏ và giải thích kết quả", path: "Python → thống kê → machine learning → dự án thực tế", mentor: "Cố vấn công nghệ / AI" },
  { id: "data", title: "Kỹ sư dữ liệu", group: "Dữ liệu", description: "Thiết kế luồng dữ liệu sạch, ổn định để các nhóm khác có thể phân tích và dùng lại.", skills: ["SQL", "Python", "Giải quyết vấn đề"], nextSkills: ["Pipeline dữ liệu", "Chất lượng dữ liệu"], tryThis: "Làm sạch và tổ chức dữ liệu bán hàng", path: "SQL → mô hình dữ liệu → pipeline → triển khai", mentor: "Cựu sinh viên làm việc với dữ liệu" },
  { id: "security", title: "Chuyên viên an toàn thông tin", group: "Bảo mật", description: "Tìm và giảm rủi ro trong hệ thống, quy trình và hành vi sử dụng công nghệ.", skills: ["Mạng máy tính", "Tư duy hệ thống", "Phân tích rủi ro"], nextSkills: ["Kiểm thử bảo mật", "Ứng cứu sự cố"], tryThis: "Lập bản đồ rủi ro cho một ứng dụng bạn chọn", path: "Nền tảng mạng → bảo mật ứng dụng → thực hành lab", mentor: "Cố vấn an toàn thông tin" },
  { id: "product", title: "Thiết kế sản phẩm số", group: "Thiết kế", description: "Hiểu vấn đề của người dùng và biến ý tưởng thành một trải nghiệm dễ sử dụng.", skills: ["Nghiên cứu người dùng", "Thiết kế giao diện", "Giao tiếp"], nextSkills: ["Kiểm thử khả dụng", "Thiết kế tương tác"], tryThis: "Phác thảo lại một luồng đăng ký khó dùng", path: "Quan sát → nghiên cứu → prototype → kiểm thử", mentor: "Cố vấn sản phẩm số" },
];

export const quests: Quest[] = [
  { id: "coop-data", title: "Đọc dữ liệu bán hàng cho hợp tác xã", field: "Dữ liệu", source: "Tình huống thực hành · Hợp tác xã", duration: "3–4 giờ", brief: "Một hợp tác xã muốn biết sản phẩm nào bán tốt theo mùa và nên theo dõi chỉ số gì trong tháng tới.", deliverable: "Một trang phân tích cùng 2 đề xuất hành động", steps: ["Làm sạch bảng dữ liệu thực hành", "Tìm xu hướng và ngoại lệ", "Giải thích kết quả cho người không chuyên"], skills: ["SQL", "Phân tích dữ liệu", "Trình bày insight"] },
  { id: "local-story", title: "Kể chuyện cho một sản phẩm địa phương", field: "Truyền thông", source: "Tình huống thực hành · Sản phẩm địa phương", duration: "2–3 giờ", brief: "Một sản phẩm mới cần thông điệp ngắn, rõ và gần gũi với nhóm khách hàng trẻ.", deliverable: "Thông điệp, kênh và một bản nội dung", steps: ["Xác định người xem", "Chọn câu chuyện cốt lõi", "Viết và giải thích một bản nội dung"], skills: ["Nghiên cứu", "Viết nội dung", "Giao tiếp"] },
  { id: "website", title: "Phác thảo website cho tổ chức cộng đồng", field: "Sản phẩm số", source: "Tình huống thực hành · Tổ chức cộng đồng", duration: "4–5 giờ", brief: "Một tổ chức cần trang web để người mới hiểu hoạt động và biết cách tham gia.", deliverable: "Sơ đồ nội dung và bản phác thảo trang chủ", steps: ["Xác định nhu cầu của người xem", "Sắp xếp nội dung chính", "Phác thảo và giải thích luồng tham gia"], skills: ["Thiết kế giao diện", "Tư duy hệ thống", "Giao tiếp"] },
];
