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
    "https://www.linkedin.com/in/amit-brin/",
    "https://pro.6bstudio.co.il/teacher/%D7%A2%D7%9E%D7%99%D7%AA-%D7%91%D7%A8%D7%99%D7%9F/",
    "https://www.behance.net/amitbrin",
    "https://x.com/amit_brin",
    "https://www.facebook.com/amitbdesign",
    "https://www.xplace.com/il/u/AmitBrin",
    "https://www.taasiya.co.il/friends/19138/recommand_me",
    "https://kssemac.com",
  ],
  email: "ahoovi@gmail.com",
  worksFor: {
    "@type": "CollegeOrUniversity",
    name: "אוניברסיטת רייכמן",
    alternateName: "Reichman University",
    url: "https://www.runi.ac.il",
  },
  alumniOf: [
    {
      "@type": "EducationalOrganization",
      name: "אסכולה — בית ספר לעיצוב, תל אביב",
    },
    {
      "@type": "EducationalOrganization",
      name: "6b studio",
      url: "https://www.6bstudio.co.il",
    },
  ],
};
