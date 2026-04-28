import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "עמית ברין – עיצוב | מיתוג | שיווק | הדרכה",
  description: "עמית ברין – מעצב עם 23 שנות ניסיון במיתוג, שיווק ודיגיטל, ומומחה UX/UI ופתרונות יצירתיים בעזרת AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased min-h-screen">
        <nav className="w-full border-b-2 border-black">
          <div className="max-w-[800px] mx-auto px-[clamp(20px,5vw,40px)] py-4 flex items-center gap-8 flex-wrap">
            <a href="/" className="font-black text-base ml-auto">עמית ברין</a>
            <a href="/" className="text-sm hover:border-b hover:border-black transition-all">ראשי</a>
            <a href="mailto:ahoovi@gmail.com" className="text-sm hover:border-b hover:border-black transition-all">דברו איתי</a>
          </div>
        </nav>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
