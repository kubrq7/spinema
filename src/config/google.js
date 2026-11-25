// src/config/google.js
export const GOOGLE_CLIENT_ID = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
export const GOOGLE_AUTH_CONFIGURED = GOOGLE_CLIENT_ID.length > 0;

if (!GOOGLE_AUTH_CONFIGURED && import.meta.env.DEV) {
  console.warn(
    "[SPINEMA] VITE_GOOGLE_CLIENT_ID tanımlı değil. .env.local dosyasına ekleyin ve 'npm run dev'i yeniden başlatın.",
  );
}