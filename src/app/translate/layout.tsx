import type { Metadata } from "next";

/* A working route, not a page for the index. */
export const metadata: Metadata = {
  title: "תרגום",
  robots: { index: false, follow: false },
  alternates: { canonical: "/translate" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
