/**
 * IndexNow ping. Reads the live sitemap and tells Bing (and every other
 * IndexNow participant — Yandex, Seznam, Naver) that these URLs changed.
 * Google does not participate; for Google use Search Console.
 *
 * Run after a deploy has gone live:  npm run indexnow
 *
 * The key file must stay reachable at https://www.amitbrin.com/<key>.txt
 * and contain exactly the key. Deleting it silently disables this.
 */
const HOST = "www.amitbrin.com";
const KEY = process.env.INDEXNOW_KEY || "cc0de1d65b343fb504983d820e9e1cc3";

const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urlList.length) {
  console.error("sitemap returned no <loc> entries — aborting");
  process.exit(1);
}

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

console.log(`${res.status} ${res.statusText} — ${urlList.length} urls`);
console.log(urlList.join("\n"));
if (res.status !== 200 && res.status !== 202) process.exit(1);
