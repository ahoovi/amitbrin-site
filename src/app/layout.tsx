import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amit Brin — Design & Creative Technology",
  description: "Visual communication designer, AI educator, creative technologist",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased min-h-screen">
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-sm border-b border-neutral-100">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <a href="/" className="font-bold text-lg tracking-tight">amit brin</a>
            <div className="flex gap-6 text-sm">
              <a href="/" className="hover:text-neutral-500 transition-colors">ראשי</a>
              <a href="/translate" className="hover:text-neutral-500 transition-colors">רומנית</a>
              <a href="/keys" className="hover:text-neutral-500 transition-colors">KeyFix</a>
            </div>
          </div>
        </nav>
        <main className="pt-14">
          {children}
        </main>
      </body>
    </html>
  );
}
