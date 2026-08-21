import type { Metadata } from "next";

/* A working route, not a page for the index. */
export const metadata: Metadata = {
  title: "סליחה ששלחתי וואטסאפ - גרסת הקריאה",
  robots: { index: false, follow: false },
  alternates: { canonical: "/blog/whatsapp/classic" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
