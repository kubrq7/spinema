// src/i18n/LanguageContext.jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SUPPORTED_LANGS, translations } from "./translations.js";

const STORAGE_KEY = "spinema:lang";
const LanguageContext = createContext(null);

function detectInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED_LANGS.includes(saved)) return saved;
  } catch {
    // Depolama erişilemezse tarayıcı diline göre devam et.
  }
  const browser = typeof navigator !== "undefined" ? String(navigator.language || "").toLowerCase() : "";
  return browser.startsWith("tr") ? "tr" : "en";
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectInitialLang);

  const setLang = useCallback((next) => {
    if (!SUPPORTED_LANGS.includes(next)) return;
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Depolama dolu veya gizli modda: sessizce geç.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    const dict = translations[lang];

    // Arayüz metni: {isim} yer tutucularını değiştirir; bulunamazsa Türkçeye, o da yoksa anahtara düşer.
    const t = (key, vars) => {
      const template = dict.ui[key] ?? translations.tr.ui[key] ?? key;
      if (!vars) return template;
      return template.replace(/\{(\w+)\}/g, (match, name) => (vars[name] !== undefined ? String(vars[name]) : match));
    };

    // Veri değerlerinin (tür, platform, kategori...) görünen adı.
    const term = (original) => dict.terms[original] ?? original;

    return { lang, setLang, t, term, locale: lang === "tr" ? "tr-TR" : "en-US" };
  }, [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage, LanguageProvider içinde kullanılmalıdır.");
  return context;
}