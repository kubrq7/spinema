// src/components/TmdbBadge.jsx
export default function TmdbBadge({ className = "" }) {
  return (
    <a
      href="https://www.themoviedb.org"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="The Movie Database (TMDB)"
      className={`inline-flex shrink-0 items-center rounded-md border border-amber-500/30 bg-white/5 px-2 py-0.5 text-[10px] font-extrabold tracking-[0.25em] text-amber-200 transition hover:border-amber-400/60 hover:text-amber-100 ${className}`}
    >
      <img src="/tmdb-logo.svg" alt="TMDB" className="h-3" />
    </a>
  );
}