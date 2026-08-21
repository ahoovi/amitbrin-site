import type { Metadata } from "next";

/* A working route, not a page for the index. */
export const metadata: Metadata = {
  title: "מפתחות",
  robots: { index: false, follow: false },
  alternates: { canonical: "/keys" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
