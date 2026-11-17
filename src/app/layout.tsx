import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mayowa Olusanjo | Data Analyst & Data Scientist",
  description:
    "Mayowa Olusanjo turns complex questions into thoughtful analysis, useful dashboards, and confident decisions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
