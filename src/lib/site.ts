/** One place for everything that says "this is amitbrin.com". */
export const SITE_URL = "https://www.amitbrin.com";
export const SITE_NAME = "עמית ברין";
export const OG_DEFAULT = "/media/og/og-default.png";
export const AUTHOR_ID = `${SITE_URL}/#amit`;

/** the person entity — the highest-value structured data on the site */
export const PERSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": AUTHOR_ID,
  name: "עמית ברין",
  alternateName: "Amit Brin",
  jobTitle: ["מעצב תקשורת חזותית", "מרצה"],
  url: SITE_URL,
  image: `${SITE_URL}/media/echo_v_200.png`,
  knowsAbout: [
    "חשיבה עיצובית",
    "UX/UI",
    "בינה מלאכותית יוצרת",
    "מיתוג",
    "הפקת דפוס",
    "עיצוב אריזות",
    "עיצוב ספרים",
    "עיצוב תערוכות",
    "טיפוגרפיה עברית",
  ],
  knowsLanguage: ["he", "en"],
  sameAs: [
    "https://www.linkedin.com/in/amit-brin",
    "https://www.behance.net/amitbrin",
    "https://x.com/amit_brin",
    "https://www.facebook.com/amitbdesign",
    "https://kssemac.com",
  ],
  // worksFor / alumniOf / award / email are deliberately absent until Amit
  // supplies exact wording. A missing field beats a wrong one.
};
