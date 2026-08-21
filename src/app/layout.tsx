import type { Metadata } from "next";
import "./globals.css";
import { InkDefs, INK_CSS } from "../components/InkFrame";

export const metadata: Metadata = {
  title: "עמית ברין – עיצוב | מיתוג | שיווק | הדרכה",
  description: "עמית ברין – מעצב עם 24 שנות ניסיון במיתוג, שיווק ודיגיטל, ומומחה UX/UI ופתרונות יצירתיים בעזרת AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased min-h-screen">
        {/* the ink filters + the frame CSS, mounted once for every route */}
        <style>{INK_CSS}</style>
        <InkDefs />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
