// src/components/WheelScreen.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Bookmark, BookmarkCheck, Play, X } from "lucide-react";
import {
  CATEGORY_LABELS,
  filterContent,
  formatMetrics,
  getFallbackImage,
  localizeCredit,
  localizeSummary,
} from "../data/mockData.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const SPIN_MS = 4500;
const SPIN_EASING = "cubic-bezier(0.25, 1, 0.5, 1)";
const EXTRA_TURNS = 6;
const CANVAS_SIZE = 1040;
const SEGMENT_FILLS = ["#14141b", "#1d1018", "#101015", "#240f18"];

// Sabit referans: varsayılan parametre her render'da yeni dizi üretip çarkı yeniden karıştırmasın.
const NO_ITEMS = [];

// IMDb, YouTube ve Özel Çark rozetleri aynı lüks altın rozet stilini kullanır.
const GOLD_BADGE =
  "rounded-full bg-linear-to-r from-amber-200 via-[#d4af37] to-amber-600 px-4 py-1.5 text-sm font-bold tracking-wide text-black shadow-[0_0_24px_rgba(212,175,55,0.5)]";

// Çarktaki dilimlerin komşuluğu rastgele olsun diye havuz bir kez karıştırılır.
function shuffleItems(pool) {
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function fitText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let trimmed = text;
  while (trimmed.length > 1 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }
  return `${trimmed.trimEnd()}…`;
}

function drawWheel(canvas, segments) {
  if (!canvas || segments.length === 0) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const center = size / 2;
  const radius = center - 14;
  const count = segments.length;
  const step = (Math.PI * 2) / count;

  // Dilim sayısı arttıkça yazı küçülür ve kısalır; 100 dilimde bile komşu etiketler çakışmaz.
  const textEdge = radius - 36;
  const fontSize = Math.max(10, Math.min(26, Math.floor(textEdge * step * 0.6)));
  const textSpan = Math.max(60, Math.min(radius * 0.62, textEdge - (fontSize * 0.95) / step));
  const lineWidth = count > 40 ? 1 : 2;

  ctx.clearRect(0, 0, size, size);

  // Dış altın halka
  const ring = ctx.createLinearGradient(0, 0, size, size);
  ring.addColorStop(0, "#f5e6a8");
  ring.addColorStop(0.5, "#d4af37");
  ring.addColorStop(1, "#8a6d1a");
  ctx.beginPath();
  ctx.arc(center, center, radius + 12, 0, Math.PI * 2);
  ctx.fillStyle = ring;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(center, center, radius + 2, 0, Math.PI * 2);
  ctx.fillStyle = "#09090b";
  ctx.fill();

  // Dilimler (0. dilim tam tepeden başlar, saat yönünde ilerler)
  segments.forEach((item, i) => {
    const start = -Math.PI / 2 + i * step;
    const end = start + step;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = SEGMENT_FILLS[i % SEGMENT_FILLS.length];
    ctx.fill();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = "rgba(212, 175, 55, 0.45)";
    ctx.stroke();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(start + step / 2);
    ctx.fillStyle = "#f4e4a6";
    ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(fitText(ctx, item.title, textSpan), textEdge, 0);
    ctx.restore();
  });

  // Merkez göbek
  ctx.beginPath();
  ctx.arc(center, center, radius * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "#09090b";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#d4af37";
  ctx.stroke();
}

function ResultModal({ item, saved, onClose, onSave, onSpinAgain }) {
  const { t, term, lang } = useLanguage();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isCustom = item.type === "custom";
  const isYoutube = item.type === "youtube";
  const metrics = formatMetrics(item, lang);

  let tags = [];
  if (isYoutube) tags = [item.style, ...item.categories].map((tag) => term(tag));
  else if (!isCustom) tags = item.genres.map((tag) => term(tag));

  let subtitle;
  if (isCustom) subtitle = item.host || t("modal.customSubtitle");
  else if (isYoutube) subtitle = item.channel;
  else subtitle = `${item.year} · ${localizeCredit(item.director || item.creator, lang)}`;

  const summary = isCustom ? "" : localizeSummary(item, lang);

  let saveLabel;
  if (saved) saveLabel = t("modal.saved");
  else saveLabel = isCustom ? t("modal.saveToList") : t("modal.save");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-md sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(94vw, 60rem)" }}
        className="gold-scroll max-h-[94dvh] overflow-y-auto rounded-3xl border border-amber-500/20 bg-zinc-950/80 p-4 shadow-[0_0_90px_rgba(212,175,55,0.18)] backdrop-blur-2xl sm:p-6"
      >
        {/* Üst şerit: kategori etiketi solda, kapatma halkası sağ üst köşede (görselin dışında) */}
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full border border-amber-500/20 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-100">
            {term(CATEGORY_LABELS[item.type])}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-zinc-100 shadow-[0_0_24px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.25)] ring-4 ring-white/5 backdrop-blur-xl transition hover:border-amber-400/60 hover:bg-white/15 hover:text-[#d4af37]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-[1.25fr_1fr] md:gap-7">
          <div className="relative aspect-video w-full self-start overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-zinc-900 via-[#1a0a10] to-zinc-950">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                // Gerçek görsel yüklenemezse üretilmiş kapak görseline düş (tek sefer).
                if (e.currentTarget.dataset.fallback === "1") return;
                e.currentTarget.dataset.fallback = "1";
                e.currentTarget.src = getFallbackImage(item);
              }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20" />
            <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
              {metrics.map((metric) => (
                <span key={metric} className={GOLD_BADGE}>
                  {metric}
                </span>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-col">
            <h3 className="break-words font-display text-3xl font-semibold leading-tight text-zinc-50 lg:text-4xl">
              {item.title}
            </h3>
            <p className="mt-2 break-all text-sm text-zinc-400">{subtitle}</p>

            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-amber-500/20 bg-white/5 px-3 py-1 text-xs text-amber-100/90"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {summary && <p className="mt-4 text-[15px] leading-relaxed text-zinc-300">{summary}</p>}

            {!isYoutube && !isCustom && (
              <p className="mt-3 text-sm text-zinc-500">
                {t("modal.platform")} <span className="text-zinc-300">{item.platforms.join(" · ")}</span>
              </p>
            )}

            <div className="mt-auto flex flex-col gap-3 pt-6">
              <a
                href={item.targetUrl}
                target="_blank"
                rel={isCustom ? "noopener noreferrer" : "sponsored noopener noreferrer"}
                className="flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-amber-200 via-[#d4af37] to-amber-600 px-6 py-3.5 text-sm font-extrabold tracking-[0.2em] text-black shadow-[0_0_34px_rgba(212,175,55,0.5)] transition hover:shadow-[0_0_54px_rgba(212,175,55,0.75)]"
              >
                <Play className="h-4 w-4 fill-current" /> {isCustom ? t("modal.watchOrGo") : t("modal.watchNow")}
              </a>
              {isCustom && !item.hasLink && (
                <p className="text-center text-[11px] text-zinc-500">{t("modal.searchHint")}</p>
              )}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onSave(item)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
                    saved
                      ? "border-amber-300/60 bg-white/10 text-[#d4af37] shadow-[0_0_24px_rgba(212,175,55,0.3)]"
                      : "border-amber-500/30 bg-white/5 text-amber-100 hover:border-amber-500/60"
                  }`}
                >
                  {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  {saveLabel}
                </button>
                {isCustom ? (
                  <button
                    type="button"
                    onClick={onSpinAgain}
                    className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-amber-500/50 hover:text-[#d4af37]"
                  >
                    {t("modal.spinAgain")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full px-4 py-3 text-sm text-zinc-400 transition hover:text-[#d4af37]"
                  >
                    {t("modal.backToWheel")}
                  </button>
                )}
              </div>
              {item.artSource === "tmdb" && (
                <p className="text-[10px] leading-snug text-zinc-600">{t("modal.tmdbCredit")}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function WheelScreen({
  category,
  filters,
  customItems = NO_ITEMS,
  isSaved,
  onBack,
  onResult,
  onSave,
}) {
  const { t, term } = useLanguage();
  const isCustomWheel = category === "custom";

  const pool = useMemo(
    () => (isCustomWheel ? customItems : filterContent(category, filters)),
    [isCustomWheel, customItems, category, filters],
  );
  // Havuzdaki TÜM içerik çarka girer (üst sınır yok).
  const segments = useMemo(() => shuffleItems(pool), [pool]);

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const canvasRef = useRef(null);
  const timers = useRef([]);

  useEffect(() => {
    let cancelled = false;
    drawWheel(canvasRef.current, segments);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) drawWheel(canvasRef.current, segments);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [segments]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => clearTimeout(id));
  }, []);

  // Çark yalnızca kullanıcı eylemiyle (ÇEVİR veya Tekrar Çevir) döner; kendi kendine asla dönmez.
  const spin = () => {
    if (spinning || segments.length === 0) return;

    const index = Math.floor(Math.random() * segments.length);
    const segDeg = 360 / segments.length;
    const jitter = (Math.random() - 0.5) * segDeg * 0.7;
    const target = -((index + 0.5) * segDeg + jitter);
    const current = rotation % 360;
    const delta = (((target - current) % 360) + 360) % 360;

    setWinner(null);
    setModalOpen(false);
    setSpinning(true);
    setRotation(rotation + 360 * EXTRA_TURNS + delta);

    timers.current.push(
      setTimeout(() => {
        const picked = segments[index];
        setSpinning(false);
        setRotation((r) => ((r % 360) + 360) % 360);
        setWinner(picked);
        onResult(picked);
        timers.current.push(setTimeout(() => setModalOpen(true), 450));
      }, SPIN_MS),
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col items-center px-4 pb-3 pt-3 sm:px-8"
    >
      <div className="flex w-full shrink-0 items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={spinning}
          className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-[#d4af37] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" /> {isCustomWheel ? t("wheel.backCustom") : t("wheel.back")}
        </button>
        <span className="rounded-full border border-amber-500/20 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-amber-100/90">
          {t("wheel.badge", { category: term(CATEGORY_LABELS[category]), count: pool.length })}
        </span>
      </div>

      <h2 className="mt-3 shrink-0 text-center font-display text-3xl font-semibold text-zinc-50 sm:text-4xl [@media(max-height:680px)]:hidden">
        {t("wheel.title")}
      </h2>

      <div className="flex min-h-0 w-full flex-1 items-center justify-center py-5">
        {segments.length === 0 ? (
          <p className="text-zinc-400">{t("wheel.empty")}</p>
        ) : (
          <div
            className="relative"
            style={{ width: "max(11rem, min(90vw, 600px, calc(100dvh - 19.5rem)))" }}
          >
            <div className="pointer-events-none absolute inset-0 rounded-full bg-[#d4af37]/20 blur-3xl" />

            <svg
              className="absolute left-1/2 top-0 z-20 h-11 w-9 -translate-x-1/2 -translate-y-3 drop-shadow-[0_0_14px_rgba(212,175,55,0.9)]"
              viewBox="0 0 36 44"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="spinemaPointer" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#f5e6a8" />
                  <stop offset="1" stopColor="#b8901f" />
                </linearGradient>
              </defs>
              <path d="M18 44 L2 8 Q18 -4 34 8 Z" fill="url(#spinemaPointer)" />
            </svg>

            <div className="relative aspect-square w-full">
              <div
                className="h-full w-full will-change-transform"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? `transform ${SPIN_MS}ms ${SPIN_EASING}` : "none",
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                  className="h-full w-full rounded-full"
                />
              </div>

              <motion.button
                type="button"
                onClick={spin}
                disabled={spinning}
                whileHover={spinning ? undefined : { scale: 1.06 }}
                whileTap={spinning ? undefined : { scale: 0.94 }}
                className="absolute inset-0 z-10 m-auto flex h-[22%] w-[22%] items-center justify-center rounded-full border border-amber-200/60 bg-linear-to-br from-amber-200 via-[#d4af37] to-amber-700 text-[clamp(0.65rem,2.4vw,1.05rem)] font-extrabold tracking-[0.2em] text-black shadow-[0_0_40px_rgba(212,175,55,0.6)] transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("wheel.spin")}
              </motion.button>
            </div>
          </div>
        )}
      </div>

      <div className="flex h-11 shrink-0 items-center gap-4">
        {winner && !modalOpen && !spinning && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-full border border-amber-500/30 px-5 py-2.5 text-sm text-amber-100 transition hover:border-amber-500/60"
          >
            {t("wheel.showResult")}
          </button>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && winner && (
          <ResultModal
            key={winner.id}
            item={winner}
            saved={isSaved(winner.id)}
            onClose={() => setModalOpen(false)}
            onSave={onSave}
            onSpinAgain={spin}
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
}