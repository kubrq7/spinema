// src/components/HomeScreen.jsx
import { motion } from "framer-motion";
import { ArrowRight, Film, MonitorPlay, Sparkles, Tv } from "lucide-react";
import { CATEGORY_LABELS, getPool } from "../data/mockData.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const CARDS = [
  { key: "dizi", index: "01", icon: Tv },
  { key: "film", index: "02", icon: Film },
  { key: "youtube", index: "03", icon: MonitorPlay },
  { key: "custom", index: "04", icon: Sparkles },
];

export default function HomeScreen({ onSelect, customCount = 0 }) {
  const { t, term } = useLanguage();

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 pb-4 pt-3 sm:px-8 sm:pb-6 sm:pt-6"
    >
      <div className="mx-auto mb-4 max-w-2xl shrink-0 text-center sm:mb-6">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.5em] text-[#d4af37] sm:mb-3 sm:text-xs">
          {t("home.eyebrow")}
        </p>
        <h1 className="font-display text-3xl font-semibold leading-tight text-zinc-50 sm:text-5xl">
          {t("home.title")}
        </h1>
        <p className="mt-3 text-sm text-zinc-400 sm:text-base [@media(max-height:700px)]:hidden">
          {t("home.subtitle")}
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-4 gap-3 sm:grid-cols-2 sm:grid-rows-2 lg:grid-cols-4 lg:grid-rows-1 lg:gap-6">
        {CARDS.map((card, i) => {
          const Icon = card.icon;
          const isCustom = card.key === "custom";
          const countText = isCustom
            ? customCount > 0
              ? t("home.customCount", { count: customCount })
              : t("home.customEmpty")
            : t("home.count", { count: getPool(card.key).length });

          return (
            <motion.button
              key={card.key}
              type="button"
              onClick={() => onSelect(card.key)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex h-full min-h-0 items-center gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left backdrop-blur-2xl transition-colors duration-500 hover:border-amber-500/40 sm:flex-col sm:items-stretch sm:justify-between sm:p-5 lg:p-8"
            >
              <span className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#d4af37]/0 blur-3xl transition-all duration-700 group-hover:bg-[#d4af37]/25" />
              <span className="pointer-events-none absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-[#881337]/0 blur-3xl transition-all duration-700 group-hover:bg-[#881337]/40" />

              <div className="relative flex shrink-0 items-start justify-between sm:w-full">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-black/40 text-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.12)] transition-shadow duration-500 group-hover:shadow-[0_0_40px_rgba(212,175,55,0.35)] sm:h-14 sm:w-14 lg:h-16 lg:w-16">
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" strokeWidth={1.4} />
                </span>
                <span className="hidden font-display text-3xl text-white/15 lg:block">{card.index}</span>
              </div>

              <div className="relative min-w-0 flex-1 sm:flex-none">
                <h2 className="break-words font-display text-3xl font-semibold leading-tight text-zinc-50 sm:text-4xl">
                  {term(CATEGORY_LABELS[card.key])}
                </h2>
                <p className="mt-2 hidden text-sm leading-relaxed text-zinc-400 sm:line-clamp-3">
                  {t(`home.tagline.${card.key}`)}
                </p>
                <div className="mt-1 flex items-center justify-between sm:mt-3 sm:border-t sm:border-white/10 sm:pt-3 lg:mt-5 lg:pt-4">
                  <span className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">{countText}</span>
                  <span className="hidden h-10 w-10 items-center justify-center rounded-full border border-amber-500/30 text-[#d4af37] transition-all duration-500 group-hover:bg-[#d4af37] group-hover:text-black lg:flex">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>

              <ArrowRight className="relative h-5 w-5 shrink-0 text-[#d4af37] sm:hidden" />
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}