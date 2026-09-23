import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CARIO — Hành trình nghề nghiệp của bạn",
  description: "Khám phá bản thân, thử nghề qua nhiệm vụ thực tế và xây dựng hồ sơ năng lực cùng CARIO.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
