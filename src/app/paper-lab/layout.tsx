import type { Metadata } from "next";

/* Tuning tool — must never be indexed. */
export const metadata: Metadata = {
  title: "Paper Lab",
  robots: { index: false, follow: false, nocache: true },
};

export default function PaperLabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
