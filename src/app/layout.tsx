import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const bodyFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const headingFont = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neon Nocturne Finance",
  description: "An editorial finance dashboard with dark-fluid surfaces and role-based UI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
