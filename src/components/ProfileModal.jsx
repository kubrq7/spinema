// src/components/ProfileModal.jsx
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { Bookmark, Clock, LogOut, Trash2, X } from "lucide-react";
import { CATEGORY_LABELS, formatMetrics } from "../data/mockData.js";
import { GOOGLE_AUTH_CONFIGURED } from "../config/google.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function formatDate(timestamp, locale) {
  try {
    return new Date(timestamp).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "";
  }
}

function SavedPoster({ item, onRemove }) {
  const { t, term, lang } = useLanguage();

  return (
    <div className="group relative aspect-[2/3] overflow-hidden rounded-2xl border border-amber-500/20 bg-linear-to-br from-zinc-900 via-[#1a0a10] to-zinc-950">
      <img
        src={item.posterUrl || item.imageUrl}
        alt={item.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/25 to-transparent" />
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={t("profile.removeSaved", { title: item.title })}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/60 text-zinc-200 opacity-100 backdrop-blur-md transition hover:border-rose-400/60 hover:text-rose-300 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="absolute inset-x-0 bottom-0 p-3">
        <span className="text-[10px] uppercase tracking-[0.25em] text-amber-200/80">
          {term(CATEGORY_LABELS[item.type])}
        </span>
        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-zinc-50">{item.title}</p>
        <p className="mt-1 text-xs text-amber-100/80">{formatMetrics(item, lang).join(" · ")}</p>
      </div>
    </div>
  );
}

export default function ProfileModal({
  open,
  hint,
  error,
  user,
  saved,
  history,
  onClose,
  onGoogleCredential,
  onGoogleError,
  onLogout,
  onRemoveSaved,
  onClearHistory,
  onOpenPrivacy,
}) {
  const { t, term, lang, locale } = useLanguage();
  const [tab, setTab] = useState("saved");

  // Google düğmesi piksel genişliği ister; dar telefon ekranlarında küçültülür.
  const [buttonWidth] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 420 ? "240" : "320",
  );

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="profile-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={t("profile.eyebrow")}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90dvh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-amber-500/20 bg-zinc-950/85 shadow-[0_0_80px_rgba(212,175,55,0.14)] backdrop-blur-2xl"
          >
            {!user ? (
              <div className="relative p-8 sm:p-12">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t("common.close")}
                  className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition hover:border-amber-500/50 hover:text-[#d4af37]"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="mx-auto max-w-sm text-center">
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.5em] text-[#d4af37]">
                    {t("profile.eyebrow")}
                  </p>
                  <h3 className="font-display text-4xl font-semibold text-zinc-50">{t("profile.heading")}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{t("profile.body")}</p>

                  {hint && (
                    <p className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                      {hint}
                    </p>
                  )}

                  {/* Google'ın resmî düğmesi: marka kurallarına uygundur, kendi "G" ikonu çizmeyin. */}
                  <div className="mt-8 flex flex-col items-center gap-3">
                    {GOOGLE_AUTH_CONFIGURED ? (
                      <GoogleLogin
                        key={lang}
                        onSuccess={onGoogleCredential}
                        onError={onGoogleError}
                        theme="filled_black"
                        size="large"
                        shape="pill"
                        text="signin_with"
                        locale={lang}
                        width={buttonWidth}
                      />
                    ) : (
                      <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                        {t("login.notConfigured")}
                      </p>
                    )}
                    {error && <p className="text-sm text-rose-300">{error}</p>}
                  </div>

                  <p className="mt-6 text-xs text-zinc-500">{t("profile.deviceNote")}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {t("profile.privacyLead")}{" "}
                    <button
                      type="button"
                      onClick={onOpenPrivacy}
                      className="text-[#d4af37] underline underline-offset-2 transition hover:text-amber-200"
                    >
                      {t("profile.privacyLink")}
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-amber-400/60 shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                      <span className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-amber-200 via-[#d4af37] to-amber-700 text-lg font-bold uppercase text-black">
                        {user.name.trim().charAt(0) || "S"}
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
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-100">{user.name}</p>
                      <p className="truncate text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onLogout}
                      className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:border-amber-500/40"
                    >
                      <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">{t("profile.logout")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label={t("common.close")}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition hover:border-amber-500/50 hover:text-[#d4af37]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 px-6 pt-5">
                  {[
                    { key: "saved", label: t("profile.tabSaved", { count: saved.length }), icon: Bookmark },
                    { key: "history", label: t("profile.tabHistory", { count: history.length }), icon: Clock },
                  ].map((tabItem) => {
                    const Icon = tabItem.icon;
                    const active = tab === tabItem.key;
                    return (
                      <button
                        key={tabItem.key}
                        type="button"
                        onClick={() => setTab(tabItem.key)}
                        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                          active
                            ? "border-amber-300/60 bg-linear-to-r from-amber-200 via-[#d4af37] to-amber-600 text-black shadow-[0_0_24px_rgba(212,175,55,0.4)]"
                            : "border-white/10 bg-white/5 text-zinc-300 hover:border-amber-500/40"
                        }`}
                      >
                        <Icon className="h-4 w-4" /> {tabItem.label}
                      </button>
                    );
                  })}
                </div>

                <div className="gold-scroll min-h-0 flex-1 overflow-y-auto p-6">
                  {tab === "saved" ? (
                    saved.length === 0 ? (
                      <p className="py-16 text-center text-sm text-zinc-500">{t("profile.emptySaved")}</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {saved.map((item) => (
                          <SavedPoster key={item.id} item={item} onRemove={onRemoveSaved} />
                        ))}
                      </div>
                    )
                  ) : history.length === 0 ? (
                    <p className="py-16 text-center text-sm text-zinc-500">{t("profile.emptyHistory")}</p>
                  ) : (
                    <div>
                      <div className="mb-4 flex justify-end">
                        <button
                          type="button"
                          onClick={onClearHistory}
                          className="flex items-center gap-2 text-xs text-zinc-400 transition hover:text-rose-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> {t("profile.clearHistory")}
                        </button>
                      </div>
                      <ul className="space-y-3">
                        {history.map((item) => (
                          <li
                            key={`${item.id}-${item.watchedAt}`}
                            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                          >
                            <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-linear-to-br from-zinc-900 to-[#1a0a10]">
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                loading="lazy"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-zinc-100">{item.title}</p>
                              <p className="mt-1 text-xs text-zinc-500">
                                {term(CATEGORY_LABELS[item.type])} · {formatMetrics(item, lang).join(" · ")}
                              </p>
                            </div>
                            <span className="hidden shrink-0 text-xs text-zinc-500 sm:block">
                              {formatDate(item.watchedAt, locale)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}