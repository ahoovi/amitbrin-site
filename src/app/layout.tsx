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
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
