// src/data/customWheel.js
export const CUSTOM_STORAGE_KEY = "spinema:custom-options";
export const MIN_CUSTOM_OPTIONS = 2;
export const MAX_CUSTOM_OPTIONS = 100;
export const MAX_TITLE_LENGTH = 60;

export function createOptionId() {
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Yalnızca http/https adreslerine izin verir (javascript:, data: gibi şemalar reddedilir).
// Şemasız yazılan adresler (ör. ornek.com/izle) otomatik https:// alır. Geçersizse "" döner.
export function normalizeUrl(text) {
  const raw = String(text || "").trim();
  if (!raw) return "";

  let candidate = raw;
  if (!/^https?:\/\//i.test(raw)) {
    // "ornek.com:8080" (port) serbest, "javascript:..." gibi şemalar reddedilir.
    if (/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(raw)) return "";
    candidate = `https://${raw}`;
  }

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    if (!url.hostname.includes(".")) return "";
    return url.toString();
  } catch {
    return "";
  }
}

// Kayıtlı listeyi okur ve bozuk/yinelenen girdileri temizleyerek döndürür.
export function loadCustomOptions() {
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    const seenTitles = new Set();
    const seenIds = new Set();
    const result = [];

    parsed.forEach((entry) => {
      if (!entry || typeof entry.title !== "string") return;
      const title = entry.title.replace(/\s+/g, " ").trim().slice(0, MAX_TITLE_LENGTH);
      if (!title) return;

      const titleKey = title.toLowerCase();
      if (seenTitles.has(titleKey)) return;

      let id = typeof entry.id === "string" && entry.id ? entry.id : createOptionId();
      if (seenIds.has(id)) id = createOptionId();

      seenTitles.add(titleKey);
      seenIds.add(id);
      result.push({ id, title, url: normalizeUrl(entry.url) });
    });

    return result.slice(0, MAX_CUSTOM_OPTIONS);
  } catch {
    return [];
  }
}

export function saveCustomOptions(options) {
  try {
    localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(options));
  } catch {
    // Depolama dolu veya gizli modda: sessizce geç.
  }
}