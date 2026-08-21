import { getPost } from "./postsIndex";

/** The publication date, visible and machine-readable, in DD.MM.YYYY. */
export default function PostDate({ slug, className = "" }: { slug: string; className?: string }) {
  const p = getPost(slug);
  if (!p?.published) return null;
  const [y, m, d] = p.published.split("-");
  return (
    <time className={"post-date " + className} dateTime={p.published}>
      {d}.{m}.{y}
    </time>
  );
}
