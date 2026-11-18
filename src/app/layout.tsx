import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mayowa Philips Olusanjo | Data Scientist & Data Analyst",
  description:
    "Mayowa Philips Olusanjo analyzes data and builds practical machine-learning models that help businesses make better decisions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
