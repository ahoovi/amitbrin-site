import type { Metadata } from "next";

/* A working route, not a page for the index. */
export const metadata: Metadata = {
  title: "בדיקת הקריעה",
  robots: { index: false, follow: false },
  alternates: { canonical: "/tear-test" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
