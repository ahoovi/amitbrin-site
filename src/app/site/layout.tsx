import type { Metadata } from "next";

/**
 * /site is a near-duplicate of / — the crawler already sees the whole
 * one-pager inside the entrance page's HTML, so this route adds nothing to
 * the index and only splits the signal between two almost identical
 * documents. It stays alive, shareable and linkable; it just stops
 * competing with the page it duplicates.
 */
export const metadata: Metadata = {
  title: "עמית ברין - עבודות, כתיבה ומה שביניהן",
  description:
    "הגרסה המלאה של האתר: קייס סטאדיז, הספרייה של תה, כתיבה על עיצוב וחוויית שימוש.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
