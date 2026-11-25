// src/components/CustomWheelSetup.jsx
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Link2, Plus, Sparkles, Trash2, X } from "lucide-react";
import {
  MAX_CUSTOM_OPTIONS,
  MAX_TITLE_LENGTH,
  MIN_CUSTOM_OPTIONS,
  createOptionId,
  normalizeUrl,
} from "../data/customWheel.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

// Tailwind v4 çekirdeğinde "scrollbar-none" yoktur; burada tanımlanır.
const SCROLLBAR_CSS = `
.scrollbar-none {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
`;

const FADE_MASK = "linear-gradient(to bottom, black calc(100% - 16px), transparent)";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-hidden transition focus:border-amber-500/50";

export default function CustomWheelSetup({ options, onChange, onBack, onContinue }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState(null);
  const titleRef = useRef(null);

  const canContinue = options.length >= MIN_CUSTOM_OPTIONS;

  // Enter tuşu da form gönderimi olduğu için aynı fonksiyonu tetikler.
  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanTitle = title.replace(/\s+/g, " ").trim();
    if (!cleanTitle) {
      setError({ key: "custom.errEmpty" });
      return;
    }
    if (options.length >= MAX_CUSTOM_OPTIONS) {
      setError({ key: "custom.errLimit", vars: { max: MAX_CUSTOM_OPTIONS } });
      return;
    }
    if (options.some((option) => option.title.toLowerCase() === cleanTitle.toLowerCase())) {
      setError({ key: "custom.errDuplicate" });
      return;
    }

    let url = "";
    if (link.trim()) {
      url = normalizeUrl(link);
      if (!url) {
        setError({ key: "custom.errUrl" });
        return;
      }
    }

    onChange([...options, { id: createOptionId(), title: cleanTitle, url }]);
    setTitle("");
    setLink("");
    setError(null);
    if (titleRef.current) titleRef.current.focus();
  };

  const handleRemove = (id) => {
    onChange(options.filter((option) => option.id !== id));
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-4 pb-4 pt-3 sm:px-8 sm:pb-6 sm:pt-5"
    >
      <style>{SCROLLBAR_CSS}</style>

      <div className="shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 flex items-center gap-2 text-sm text-zinc-400 transition hover:text-[#d4af37]"
        >
          <ArrowLeft className="h-4 w-4" /> {t("custom.back")}
        </button>

        <p className="mb-1 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.5em] text-[#d4af37] sm:text-xs">
          <Sparkles className="h-3.5 w-3.5" /> {t("custom.eyebrow")}
        </p>
        <h2 className="font-display text-3xl font-semibold text-zinc-50 sm:text-4xl">{t("custom.title")}</h2>
        <p className="mt-2 max-w-xl text-sm text-zinc-400 [@media(max-height:760px)]:hidden">
          {t("custom.help")}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-4 shrink-0 rounded-2xl border border-amber-500/20 bg-white/[0.03] p-4 backdrop-blur-2xl sm:p-5"
      >
        <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_auto] sm:items-end">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400">
              {t("custom.optionLabel")}
            </span>
            <input
              ref={titleRef}
              type="text"
              value={title}
              maxLength={MAX_TITLE_LENGTH}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("custom.optionPlaceholder")}
              autoComplete="off"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400">
              {t("custom.linkLabel")}
            </span>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder={t("custom.linkPlaceholder")}
              autoComplete="off"
              inputMode="url"
              className={inputClass}
            />
          </label>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-amber-200 via-[#d4af37] to-amber-600 px-6 py-3 text-sm font-bold tracking-wide text-black shadow-[0_0_28px_rgba(212,175,55,0.4)] transition hover:shadow-[0_0_44px_rgba(212,175,55,0.65)]"
          >
            <Plus className="h-4 w-4" /> {t("custom.add")}
          </button>
        </div>

        {error && <p className="mt-3 text-xs text-rose-300">{t(error.key, error.vars)}</p>}
      </form>

      <div className="mt-4 flex shrink-0 items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-300">
            {t("custom.listTitle")}
          </h3>
          <span className="text-xs text-zinc-500">
            {t("custom.counter", { count: options.length, max: MAX_CUSTOM_OPTIONS })}
          </span>
        </div>
        {options.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="flex items-center gap-1.5 text-xs text-zinc-400 transition hover:text-rose-300"
          >
            <Trash2 className="h-3.5 w-3.5" /> {t("custom.clearAll")}
          </button>
        )}
      </div>

      <div
        className="scrollbar-none mt-3 min-h-0 flex-1 overflow-y-auto pb-2"
        style={{ WebkitMaskImage: FADE_MASK, maskImage: FADE_MASK }}
      >
        {options.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">
            {t("custom.empty")}
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            <AnimatePresence initial={false}>
              {options.map((option) => (
                <motion.li
                  key={option.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className="flex max-w-full items-center gap-2 rounded-full border border-amber-400/40 bg-linear-to-r from-amber-500/10 to-[#d4af37]/5 py-1.5 pl-4 pr-1.5 text-sm text-amber-100 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                >
                  <span className="max-w-[14rem] truncate sm:max-w-[22rem]">{option.title}</span>
                  {option.url && (
                    <span title={t("custom.hasLink")} className="shrink-0 text-[#d4af37]">
                      <Link2 className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(option.id)}
                    aria-label={t("custom.remove", { title: option.title })}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/40 text-zinc-300 transition hover:border-rose-400/60 hover:text-rose-300"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <div className="mt-auto flex shrink-0 flex-col gap-3 rounded-2xl border border-white/10 bg-black/60 p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <p className="text-sm text-zinc-400">
          {canContinue ? (
            <>
              <span className="font-semibold text-[#d4af37]">{options.length}</span>{" "}
              {t("custom.ready", { count: "" }).trim()}
            </>
          ) : (
            t("custom.minHint", { min: MIN_CUSTOM_OPTIONS })
          )}
        </p>
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-amber-200 via-[#d4af37] to-amber-600 px-7 py-2.5 text-sm font-bold tracking-wide text-black shadow-[0_0_30px_rgba(212,175,55,0.4)] transition hover:shadow-[0_0_44px_rgba(212,175,55,0.65)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {t("custom.prepare")} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.section>
  );
}