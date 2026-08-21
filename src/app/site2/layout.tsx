import type { Metadata } from "next";

/* A working draft route, not a page for the index. */
export const metadata: Metadata = {
  title: "עמית ברין - טיוטה",
  robots: { index: false, follow: false },
  alternates: { canonical: "/site2" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
