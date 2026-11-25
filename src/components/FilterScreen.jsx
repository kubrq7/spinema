// src/components/FilterScreen.jsx
import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import {
  CATEGORY_LABELS,
  EMPTY_FILTERS,
  GENRES,
  MOODS,
  PLATFORMS,
  YT_CATEGORIES,
  YT_CULTURES,
  filterContent,
} from "../data/mockData.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

// [Dizi & Film] yalnızca mood, genre, platform. Dönem/Yıl filtresi YOKTUR.
const FILM_DIZI_GROUPS = [
  { key: "mood", titleKey: "filter.group.mood", options: MOODS },
  { key: "genre", titleKey: "filter.group.genre", options: GENRES },
  { key: "platform", titleKey: "filter.group.platform", options: PLATFORMS },
];

// [YouTube] yalnızca culture ve category. Süre filtresi YOKTUR.
const YOUTUBE_GROUPS = [
  { key: "culture", titleKey: "filter.group.culture", options: YT_CULTURES },
  { key: "category", titleKey: "filter.group.category", options: YT_CATEGORIES },
];

// Tailwind v4 çekirdeğinde "scrollbar-none" yardımcı sınıfı yoktur; burada tanımlanır.
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

// Çubuk gizli olduğu için, kaydırılabilir içeriğin alt kenarında hafif bir solma ipucu verir.
const FADE_MASK = "linear-gradient(to bottom, black calc(100% - 16px), transparent)";

function Chip({ label, selected, onToggle }) {
  const base = "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-300";
  const state = selected
    ? "border-amber-300/60 bg-linear-to-r from-amber-200 via-[#d4af37] to-amber-600 text-black shadow-[0_0_28px_rgba(212,175,55,0.45)]"
    : "border-white/10 bg-white/5 text-zinc-300 hover:border-amber-500/40 hover:text-amber-200";

  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      whileTap={{ scale: 0.94 }}
      className={`${base} ${state}`}
    >
      {label}
    </motion.button>
  );
}

export default function FilterScreen({ category, filters, onChange, onBack, onContinue }) {
  const { t, term } = useLanguage();
  const groups = category === "youtube" ? YOUTUBE_GROUPS : FILM_DIZI_GROUPS;

  const matchCount = useMemo(() => filterContent(category, filters).length, [category, filters]);
  const selectedCount = groups.reduce((total, group) => total + (filters[group.key] || []).length, 0);

  const toggle = (key, option) => {
    const current = filters[key] || [];
    const next = current.includes(option) ? current.filter((o) => o !== option) : [...current, option];
    onChange({ ...filters, [key]: next });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-auto flex h-[calc(100vh-80px)] min-h-0 w-full max-w-5xl flex-col justify-start px-4 pb-4 pt-3 sm:px-8 sm:pb-6 sm:pt-5"
    >
      <style>{SCROLLBAR_CSS}</style>

      {/* ÜST KONTROL ÇUBUĞU: sabit */}
      <div className="mb-4 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 flex items-center gap-2 text-sm text-zinc-400 transition hover:text-[#d4af37]"
        >
          <ArrowLeft className="h-4 w-4" /> {t("filter.back")}
        </button>

        <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.5em] text-[#d4af37] sm:text-xs">
          {t("filter.eyebrow", { category: term(CATEGORY_LABELS[category]) })}
        </p>
        <h2 className="font-display text-3xl font-semibold text-zinc-50 sm:text-4xl">{t("filter.title")}</h2>
        <p className="mt-2 max-w-xl text-sm text-zinc-400 [@media(max-height:760px)]:hidden">{t("filter.help")}</p>
      </div>

      {/* ORTA GÖVDE: bağımsız iç kaydırma alanı */}
      <div
        className="scrollbar-none min-h-0 flex-1 space-y-4 overflow-y-auto pb-4 pr-1"
        style={{ WebkitMaskImage: FADE_MASK, maskImage: FADE_MASK }}
      >
        {groups.map((group) => (
          <div
            key={group.key}
            className="rounded-2xl border border-amber-500/20 bg-white/[0.03] p-5 backdrop-blur-2xl"
          >
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-300">
              {t(group.titleKey)}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => (
                <Chip
                  key={option}
                  label={term(option)}
                  selected={(filters[group.key] || []).includes(option)}
                  onToggle={() => toggle(group.key, option)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ALT AKSİYON PANELİ: mt-auto ile ekranın en altına çivilenir */}
      <div className="mt-auto flex shrink-0 flex-col gap-3 rounded-2xl border border-white/10 bg-black/60 p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="text-sm text-zinc-400">
          <span className="font-semibold text-[#d4af37]">{matchCount}</span>{" "}
           {t("filter.matchCount", { count: "" }).trim()}
          {selectedCount > 0 && (
            <span className="text-zinc-500"> · {t("filter.activeFilters", { count: selectedCount })}</span>
          )}
          {matchCount === 0 && <p className="mt-1 text-xs text-rose-300/80">{t("filter.noMatch")}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange({ ...EMPTY_FILTERS })}
            disabled={selectedCount === 0}
            className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm text-zinc-300 transition hover:border-amber-500/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" /> {t("filter.clear")}
          </button>
          <button
            type="button"
            onClick={onContinue}
            disabled={matchCount === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-linear-to-r from-amber-200 via-[#d4af37] to-amber-600 px-7 py-2.5 text-sm font-bold tracking-wide text-black shadow-[0_0_30px_rgba(212,175,55,0.4)] transition hover:shadow-[0_0_44px_rgba(212,175,55,0.65)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:flex-none"
          >
            {t("filter.prepare")} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.section>
  );
}