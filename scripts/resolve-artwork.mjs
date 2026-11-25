// scripts/resolve-artwork.mjs
// Film/dizi afişlerini (TMDB) ve YouTube video kimliklerini, kapaklarını, gerçek sayaçlarını çözer.
// Sonuç src/data/artwork.js dosyasına yazılır. Anahtarlar siteye GİRMEZ; yalnızca bu betik kullanır.
//
// Kullanım:
//   node scripts/resolve-artwork.mjs               -> TMDB + YouTube
//   node scripts/resolve-artwork.mjs --only=tmdb
//   node scripts/resolve-artwork.mjs --only=youtube
//   node scripts/resolve-artwork.mjs --force       -> daha önce çözülenleri de yeniden çözer
//
// Elle düzeltme: ham veride bir içeriğe tmdbId: 12345 (film/dizi) veya videoId: "xxxxxxxxxxx" (YouTube)
// ekleyip betiği tekrar çalıştırın.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import existingArtwork from "../src/data/artwork.js";
import { movies, series, youtubeVideos } from "../src/data/mockData.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ARTWORK_FILE = path.join(ROOT, "src", "data", "artwork.js");

function loadEnvFiles() {
  [".env.local", ".env"].forEach((name) => {
    const file = path.join(ROOT, name);
    if (!fs.existsSync(file)) return;
    fs.readFileSync(file, "utf8")
      .split(/\r?\n/)
      .forEach((line) => {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
        if (!match) return;
        const key = match[1];
        if (process.env[key] !== undefined) return;
        process.env[key] = match[2].replace(/^["']|["']$/g, "");
      });
  });
}

loadEnvFiles();

const TMDB_KEY = (process.env.TMDB_API_KEY || "").trim();
const YT_KEY = (process.env.YOUTUBE_API_KEY || "").trim();
const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const onlyArg = args.find((arg) => arg.startsWith("--only="));
const ONLY = onlyArg ? onlyArg.split("=")[1] : "all";

const artwork = { ...existingArtwork };

/* ---------- Yardımcılar ---------- */
function saveArtwork(data) {
  const body =
    "// Bu dosya scripts/resolve-artwork.mjs tarafından otomatik üretilir. Elle düzenlemeyin.\n" +
    `export default ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(ARTWORK_FILE, body, "utf8");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalize = (text) =>
  String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const tokens = (text) =>
  String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);

// "a" metnindeki sözcüklerin ne kadarı "b" metninde geçiyor (0-1)
function similarity(a, b) {
  const wanted = new Set(tokens(a));
  const found = new Set(tokens(b));
  if (wanted.size === 0) return 0;
  let hits = 0;
  wanted.forEach((token) => {
    if (found.has(token)) hits += 1;
  });
  return hits / wanted.size;
}

function trimZero(text) {
  return text.replace(/\.0$/, "");
}

function formatCount(value) {
  const n = Number(value);
  if (value === undefined || value === null || !Number.isFinite(n)) return null;
  if (n >= 1e9) return `${trimZero((n / 1e9).toFixed(1))}B`;
  if (n >= 1e6) return `${trimZero((n / 1e6).toFixed(n >= 1e7 ? 0 : 1))}M`;
  if (n >= 1e3) return `${trimZero((n / 1e3).toFixed(n >= 1e4 ? 0 : 1))}K`;
  return String(n);
}

async function fetchJson(url, options = {}, attempt = 0) {
  const response = await fetch(url, options);
  if (response.status === 429 && attempt < 4) {
    const wait = Number(response.headers.get("retry-after")) || 2;
    await sleep(wait * 1000);
    return fetchJson(url, options, attempt + 1);
  }
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status} (${url.split("?")[0]})`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

async function runPool(items, limit, worker) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index], index);
    }
  });
  await Promise.all(runners);
}

/* ---------- TMDB (film + dizi) ---------- */
const TMDB_QUERY_OVERRIDES = {
  "film-16": "Star Wars",
  "film-78": "WALL-E",
};

function tmdbRequest(pathname, params = {}) {
  const url = new URL(`https://api.themoviedb.org/3${pathname}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });
  const options = { headers: { accept: "application/json" } };
  if (TMDB_KEY.startsWith("eyJ")) {
    options.headers.Authorization = `Bearer ${TMDB_KEY}`;
  } else {
    url.searchParams.set("api_key", TMDB_KEY);
  }
  return fetchJson(url.toString(), options);
}

function tmdbQuery(item) {
  if (TMDB_QUERY_OVERRIDES[item.id]) return TMDB_QUERY_OVERRIDES[item.id];
  return item.title.replace(/\s*\(.*?\)\s*/g, " ").trim();
}

function yearOf(result) {
  return String(result.release_date || result.first_air_date || "").slice(0, 4) || "?";
}

function pickBest(results, query, year) {
  const target = normalize(query);
  let best = null;
  results.forEach((result, index) => {
    if (!result.poster_path && !result.backdrop_path) return;
    const names = [result.title, result.original_title, result.name, result.original_name]
      .filter(Boolean)
      .map(normalize);
    const resultYear = Number(yearOf(result)) || 0;
    let score = 0;
    if (target && names.includes(target)) score += 4;
    else if (target && names.some((name) => name && (name.includes(target) || target.includes(name)))) score += 1;
    if (resultYear && year) {
      const diff = Math.abs(resultYear - year);
      if (diff === 0) score += 3;
      else if (diff === 1) score += 2;
      else if (diff > 3) score -= 2;
    }
    score -= index * 0.05;
    if (!best || score > best.score) best = { result, score };
  });
  return best;
}

function toTmdbEntry(result, score) {
  return {
    tmdbId: result.id,
    poster: result.poster_path || null,
    backdrop: result.backdrop_path || null,
    overviewEn: result.overview || null,
    matched: `${result.title || result.name} (${yearOf(result)})`,
    score: Math.round(score * 10) / 10,
  };
}

async function resolveTmdb(item) {
  const kind = item.type === "film" ? "movie" : "tv";

  if (item.tmdbId) {
    const detail = await tmdbRequest(`/${kind}/${item.tmdbId}`, { language: "en-US" });
    return toTmdbEntry(detail, 99);
  }

  const query = tmdbQuery(item);
  const base = { query, language: "en-US", include_adult: "false" };
  const attempts = [
    { ...base, ...(kind === "movie" ? { year: item.year } : { first_air_date_year: item.year }) },
    base,
  ];

  let best = null;
  for (const params of attempts) {
    const data = await tmdbRequest(`/search/${kind}`, params);
    const candidate = pickBest(data.results || [], query, item.year);
    if (candidate && (!best || candidate.score > best.score)) best = candidate;
    if (best && best.score >= 7) break;
  }

  if (!best || best.score < 4) return null;
  return toTmdbEntry(best.result, best.score);
}

async function runTmdb() {
  if (!TMDB_KEY) {
    console.log("TMDB_API_KEY bulunamadı: film/dizi afişleri atlandı.");
    return;
  }

  try {
    await tmdbRequest("/configuration");
  } catch (error) {
    if (error.status === 401) console.log("TMDB anahtarı geçersiz (401). .env.local dosyasını kontrol edin.");
    else console.log(`TMDB'ye bağlanılamadı: ${error.message}`);
    return;
  }

  const targets = [...movies, ...series].filter((item) => {
    const entry = artwork[item.id];
    return FORCE || !(entry && (entry.poster || entry.backdrop));
  });
  console.log(`TMDB: ${targets.length} içerik çözülecek...`);

  let done = 0;
  const missed = [];
  await runPool(targets, 5, async (item) => {
    try {
      const found = await resolveTmdb(item);
      if (found) artwork[item.id] = { ...(artwork[item.id] || {}), ...found };
      else missed.push(`${item.id}  ${item.title} (${item.year})`);
    } catch (error) {
      missed.push(`${item.id}  ${item.title} (hata: ${error.message})`);
    }
    done += 1;
    if (done % 10 === 0 || done === targets.length) {
      saveArtwork(artwork);
      console.log(`  ${done}/${targets.length}`);
    }
  });
  saveArtwork(artwork);

  if (missed.length > 0) {
    console.log("\nEşleşme bulunamayan içerikler (ham veride tmdbId: 12345 ekleyip tekrar çalıştırın):");
    missed.forEach((line) => console.log(`  - ${line}`));
  }

  const review = [...movies, ...series]
    .filter((item) => artwork[item.id] && typeof artwork[item.id].score === "number" && artwork[item.id].score < 6)
    .map((item) => `  - ${item.id}  ${item.title} (${item.year})  →  ${artwork[item.id].matched}`);
  if (review.length > 0) {
    console.log("\nDüşük güvenli eşleşmeler (lütfen göz atın):");
    review.forEach((line) => console.log(line));
  }
}

/* ---------- YouTube ---------- */
function ytRequest(endpoint, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  url.searchParams.set("key", YT_KEY);
  return fetchJson(url.toString());
}

function isQuotaError(error) {
  return error.status === 403 && /quota/i.test(JSON.stringify(error.body || {}));
}

function isFatalError(error) {
  return !error.status || error.status === 400 || error.status === 401 || (error.status === 403 && !isQuotaError(error));
}

function pickBestVideo(entries, item) {
  let best = null;
  entries.forEach((entry) => {
    const videoId = entry.id && entry.id.videoId;
    if (!videoId || !entry.snippet) return;
    const titleScore = similarity(item.title, entry.snippet.title);
    const channelBonus = similarity(item.channel, entry.snippet.channelTitle) >= 0.5 ? 0.1 : 0;
    const confidence = Math.min(1, titleScore + channelBonus);
    if (!best || confidence > best.confidence) best = { videoId, title: entry.snippet.title, confidence };
  });
  return best;
}

async function fillYoutubeStats() {
  const withIds = youtubeVideos.filter((item) => artwork[item.id] && artwork[item.id].videoId);
  for (let i = 0; i < withIds.length; i += 50) {
    const chunk = withIds.slice(i, i + 50);
    const data = await ytRequest("videos", {
      part: "snippet,statistics",
      id: chunk.map((item) => artwork[item.id].videoId).join(","),
    });
    const byId = new Map((data.items || []).map((entry) => [entry.id, entry]));
    chunk.forEach((item) => {
      const entry = byId.get(artwork[item.id].videoId);
      if (!entry) return;
      const thumbs = (entry.snippet && entry.snippet.thumbnails) || {};
      const best = thumbs.maxres || thumbs.standard || thumbs.high || thumbs.medium || thumbs.default || {};
      const stats = entry.statistics || {};
      artwork[item.id] = {
        ...artwork[item.id],
        thumb: best.url || artwork[item.id].thumb,
        views: formatCount(stats.viewCount) || artwork[item.id].views,
        likes: formatCount(stats.likeCount) || artwork[item.id].likes,
        realTitle: entry.snippet ? entry.snippet.title : artwork[item.id].realTitle,
      };
    });
  }
  saveArtwork(artwork);
}

async function runYoutube() {
  if (!YT_KEY) {
    console.log("YOUTUBE_API_KEY bulunamadı: YouTube görselleri atlandı.");
    return;
  }

  const targets = youtubeVideos.filter((item) => FORCE || !(artwork[item.id] && artwork[item.id].videoId));
  console.log(`YouTube: ${targets.length} video çözülecek (arama başına 100 kota birimi, günlük kota 10.000)...`);

  const unresolved = [];
  for (const item of targets) {
    try {
      let videoId = item.videoId || null;
      let matched = "manuel";
      let confidence = 1;

      if (!videoId) {
        const data = await ytRequest("search", {
          part: "snippet",
          type: "video",
          maxResults: 3,
          q: `${item.title} ${item.channel}`,
        });
        const best = pickBestVideo(data.items || [], item);
        if (!best || best.confidence < 0.6) {
          unresolved.push(`${item.id}  ${item.title} (${item.channel})`);
          continue;
        }
        videoId = best.videoId;
        matched = best.title;
        confidence = best.confidence;
      }

      artwork[item.id] = {
        ...(artwork[item.id] || {}),
        videoId,
        matched,
        confidence: Math.round(confidence * 100) / 100,
      };
      saveArtwork(artwork);
      console.log(`  ✓ ${item.id} → ${videoId}`);
    } catch (error) {
      if (isQuotaError(error)) {
        console.log("  ! Günlük YouTube kotası doldu. Yarın aynı komutu çalıştırın; kaldığı yerden devam eder.");
        break;
      }
      if (isFatalError(error)) {
        console.log(`  ! YouTube erişim/anahtar hatası: ${error.message}`);
        break;
      }
      unresolved.push(`${item.id}  ${item.title} (hata: ${error.message})`);
    }
  }

  try {
    await fillYoutubeStats();
  } catch (error) {
    console.log(`  ! Video sayaçları alınamadı: ${error.message}`);
  }

  if (unresolved.length > 0) {
    console.log('\nEşleşme bulunamayan videolar (ham veride videoId: "xxxxxxxxxxx" ekleyip tekrar çalıştırın):');
    unresolved.forEach((line) => console.log(`  - ${line}`));
  }
}

/* ---------- Ana akış ---------- */
async function main() {
  if (ONLY === "all" || ONLY === "tmdb") await runTmdb();
  if (ONLY === "all" || ONLY === "youtube") await runYoutube();
  saveArtwork(artwork);
  console.log("\nBitti. npm run dev açıksa site kendiliğinden yenilenir.");
}

main().catch((error) => {
  saveArtwork(artwork);
  console.error("Beklenmeyen hata:", error.message);
  process.exit(1);
});