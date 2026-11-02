import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MentorConnect — Belajar bersama mentor",
  description:
    "Temukan mentor yang memahami tujuanmu. Kembangkan keterampilan dan karier melalui bimbingan satu-satu.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
