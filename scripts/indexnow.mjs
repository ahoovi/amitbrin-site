/**
 * IndexNow ping — "the site changed, come re-crawl".
 *
 * Reads the live sitemap and submits every URL in it to the IndexNow API.
 * Bing, Yandex, Seznam and Naver all read from the same endpoint. Google
 * does not participate in the protocol at all — there it is Search Console.
 *
 * Runs by itself as a `postbuild` step on Vercel, and only on production
 * builds (see the VERCEL_ENV guard) so that preview deploys never announce
 * themselves. Nothing to run by hand.
 *
 * Manual run, if ever needed:  npm run indexnow
 *
 * The key file must stay reachable at https://www.amitbrin.com/<key>.txt and
 * contain exactly the key. Deleting it silently disables this — no error.
 */
const HOST = "www.amitbrin.com";
const KEY = process.env.INDEXNOW_KEY || "cc0de1d65b343fb504983d820e9e1cc3";

// On Vercel this file runs inside `postbuild`. Preview and development builds
// must stay silent; only production announces. Outside Vercel (a manual run on
// the Mac) VERCEL_ENV is undefined and we go ahead.
if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
  console.log(`indexnow: skipped (VERCEL_ENV=${process.env.VERCEL_ENV})`);
  process.exit(0);
}

/** Never fail a deploy over this. A missed ping costs a crawl delay, nothing more. */
const bail = (msg) => {
  console.warn(`indexnow: skipped — ${msg}`);
  process.exit(0);
};

let urlList = [];
try {
  const res = await fetch(`https://${HOST}/sitemap.xml`);
  if (!res.ok) bail(`sitemap returned ${res.status}`);
  const xml = await res.text();
  urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
} catch (err) {
  bail(`could not fetch the sitemap (${err.message})`);
}
if (!urlList.length) bail("sitemap had no <loc> entries");

try {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList,
    }),
  });
  console.log(`indexnow: ${res.status} ${res.statusText} — ${urlList.length} urls submitted`);
} catch (err) {
  bail(`ping failed (${err.message})`);
}
