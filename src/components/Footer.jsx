// src/components/Footer.jsx
import TmdbBadge from "./TmdbBadge.jsx";
import { TMDB_ATTRIBUTION } from "../i18n/legalContent.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const linkClass =
  "text-zinc-400 underline decoration-white/20 underline-offset-2 transition hover:text-amber-200";

export default function Footer({ onOpenPrivacy }) {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 shrink-0 border-t border-white/10 bg-[#09090b]/70 px-4 py-2 backdrop-blur-xl sm:px-8">
      {/* Geniş ekran: tam atıf satırı */}
      <div className="mx-auto hidden max-w-7xl items-center justify-between gap-6 text-[10px] leading-4 text-zinc-500 lg:flex">
        <div className="flex items-center gap-2">
          <TmdbBadge />
          <span>{TMDB_ATTRIBUTION}</span>
        </div>

        <p className="text-center">
          {t("footer.youtube")}{" "}
          <a
            href="https://www.youtube.com/t/terms"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {t("footer.youtubeTerms")}
          </a>{" "}
          ·{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {t("footer.googlePrivacy")}
          </a>
        </p>

        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={onOpenPrivacy} className={linkClass}>
            {t("footer.privacy")}
          </button>
          <span>{t("footer.rights", { year })}</span>
        </div>
      </div>

      {/* Dar ekran: tek satır; tüm atıflar Gizlilik penceresinde yer alır */}
      <div className="flex items-center justify-between text-[10px] text-zinc-500 lg:hidden">
        <span>{t("footer.rights", { year })}</span>
        <button type="button" onClick={onOpenPrivacy} className={linkClass}>
          {t("footer.compact")}
        </button>
      </div>
    </footer>
  );
}