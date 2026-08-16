import type { Metadata } from "next";
import type { ReactNode } from "react";

/* unlisted test route - keep out of search indexes */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function HeroTestLayout({ children }: { children: ReactNode }) {
  return children;
}
