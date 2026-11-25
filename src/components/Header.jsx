// src/components/Header.jsx
import { Compass, User } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function LanguageSwitch() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("header.language")}
      className="flex items-center rounded-full border border-amber-500/20 bg-white/5 p-0.5 text-xs font-semibold backdrop-blur-xl"
    >
      {["tr", "en"].map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`rounded-full px-2.5 py-1.5 transition ${
            lang === code
              ? "bg-linear-to-r from-amber-200 via-[#d4af37] to-amber-600 text-black shadow-[0_0_16px_rgba(212,175,55,0.45)]"
              : "text-zinc-400 hover:text-amber-200"
          }`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function Header({ user, onHome, onProfile }) {
  const { t } = useLanguage();
  const initial = user ? user.name.trim().charAt(0).toUpperCase() || "S" : "";

  return (
    <header className="relative z-40 shrink-0 border-b border-white/10 bg-[#09090b]/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:px-8">
        <button
          type="button"
          onClick={onHome}
          aria-label={t("header.home")}
          className="group flex items-center gap-2 sm:gap-3"
        >
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-white/5">
            <span className="absolute inset-0 animate-pulse rounded-full bg-[#d4af37]/30 blur-md" />
            <Compass
              className="relative h-5 w-5 text-[#d4af37] transition-transform duration-700 group-hover:rotate-[135deg]"
              strokeWidth={1.5}
            />
          </span>
          <span className="bg-linear-to-r from-amber-100 via-[#d4af37] to-amber-500 bg-clip-text font-display text-xl font-semibold tracking-[0.25em] text-transparent sm:text-2xl sm:tracking-[0.35em]">
            SPINEMA
          </span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitch />

          <button
            type="button"
            onClick={onProfile}
            aria-label={user ? t("header.profileOf", { name: user.name }) : t("header.login")}
            className="flex items-center gap-3 rounded-full border border-amber-500/20 bg-white/5 py-1.5 pl-1.5 pr-1.5 text-sm text-zinc-200 backdrop-blur-xl transition hover:border-amber-500/50 hover:bg-white/10 sm:pr-4"
          >
            {user ? (
              <>
                <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-amber-400/60 shadow-[0_0_16px_rgba(212,175,55,0.45)]">
                  <span className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-amber-200 to-amber-700 text-sm font-bold text-black">
                    {initial}
                  </span>
                  <img
                    src={user.avatar}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="relative h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </span>
                <span className="hidden min-w-0 flex-col text-left leading-tight sm:flex">
                  <span className="max-w-[150px] truncate text-sm font-medium text-zinc-100">{user.name}</span>
                  <span className="max-w-[150px] truncate text-[11px] text-zinc-500">{user.email}</span>
                </span>
              </>
            ) : (
              <>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30">
                  <User className="h-4 w-4 text-[#d4af37]" strokeWidth={1.75} />
                </span>
                <span className="hidden text-sm sm:inline">{t("header.login")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}