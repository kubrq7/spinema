// src/components/PrivacyModal.jsx
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, ShieldCheck, X } from "lucide-react";
import TmdbBadge from "./TmdbBadge.jsx";
import {
  LEGAL_LINKS,
  POLICY_LAST_UPDATED,
  TMDB_ATTRIBUTION,
  getPrivacySections,
} from "../i18n/legalContent.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function PrivacyModal({ open, onClose }) {
  const { t, lang } = useLanguage();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const sections = getPrivacySections(lang);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="privacy-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={t("privacy.title")}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-amber-500/20 bg-zinc-950/90 shadow-[0_0_80px_rgba(212,175,55,0.14)] backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-white/5 text-[#d4af37]">
                  <ShieldCheck className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-2xl font-semibold text-zinc-50">{t("privacy.title")}</h2>
                  <p className="text-xs text-zinc-500">{t("privacy.updated", { date: POLICY_LAST_UPDATED })}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("common.close")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition hover:border-amber-500/50 hover:text-[#d4af37]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="gold-scroll min-h-0 flex-1 overflow-y-auto px-6 py-6">
              {sections.map((section) => (
                <section key={section.id} className="mb-7">
                  <h3 className="mb-2 font-display text-xl font-semibold text-amber-100">{section.title}</h3>

                  {section.paragraphs &&
                    section.paragraphs.map((text, index) => (
                      <p
                        key={`${section.id}-p-${index}`}
                        className="mb-2 text-sm leading-relaxed text-zinc-300"
                      >
                        {text}
                      </p>
                    ))}

                  {section.bullets && (
                    <ul className="mb-2 mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300 marker:text-[#d4af37]">
                      {section.bullets.map((text, index) => (
                        <li key={`${section.id}-b-${index}`}>{text}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              <section className="mb-7 rounded-2xl border border-amber-500/20 bg-white/[0.03] p-5">
                <h3 className="mb-3 font-display text-xl font-semibold text-amber-100">
                  {t("privacy.attributions")}
                </h3>
                <div className="flex items-start gap-3">
                  <TmdbBadge className="mt-0.5" />
                  <p className="text-sm leading-relaxed text-zinc-300">{TMDB_ATTRIBUTION}</p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{t("footer.youtube")}</p>
              </section>

              <section>
                <h3 className="mb-3 font-display text-xl font-semibold text-amber-100">{t("privacy.links")}</h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {LEGAL_LINKS.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-amber-500/40 hover:text-amber-200"
                      >
                        <span>{link.label[lang] || link.label.tr}</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#d4af37]" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}