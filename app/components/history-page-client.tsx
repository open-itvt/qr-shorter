"use client";

import { useEffect, useMemo, useState } from "react";
import SiteHeader from "./site-header";

type HistoryItem = {
  publicId: string;
  code: string;
  url: string;
  createdAt: string;
  shortUrl: string;
  statsUrl: string;
  qrDownloadUrl: string;
};

export default function HistoryPageClient() {
  const [siteLang] = useState<"pl" | "en">(() => {
    if (typeof window === "undefined") {
      return "pl";
    }

    try {
      const stored = localStorage.getItem("site-language");
      if (stored === "pl" || stored === "en") {
        return stored;
      }
    } catch {}

    return navigator.language?.startsWith("pl") ? "pl" : "en";
  });

  const [items] = useState<HistoryItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = localStorage.getItem("qr-history");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [copiedPublicId, setCopiedPublicId] = useState<string | null>(null);
  const [announce, setAnnounce] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    const preferred =
      localStorage.getItem("theme") ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    return preferred === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  const hasItems = useMemo(() => items.length > 0, [items]);

  const copy =
    siteLang === "pl"
      ? {
          title: "Historia skróconych linków",
          description: "Zobacz wszystkie utworzone skróty, ich statystyki i pobierz QR kod w jednym miejscu.",
          emptyTitle: "Brak historii",
          emptyDescription: "Utwórz pierwszy skrócony link na stronie głównej.",
          error: "Nie udało się skopiować linku.",
          copied: "Skopiowano",
          copy: "Kopiuj",
          stats: "Statystyki",
          downloadQr: "Pobierz QR",
          listLabel: "Lista zapisanych skróconych linków",
          createdAt: "Utworzono:",
        }
      : {
          title: "Short link history",
          description: "Review created short links, their statistics, and download QR codes in one place.",
          emptyTitle: "No history yet",
          emptyDescription: "Create your first short link on the home page.",
          error: "Could not copy the link.",
          copied: "Copied",
          copy: "Copy",
          stats: "Stats",
          downloadQr: "Download QR",
          listLabel: "List of saved short links",
          createdAt: "Created:",
        };

  const copyShortUrl = async (publicId: string, shortUrl: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedPublicId(publicId);
      setAnnounce(siteLang === "pl" ? "Skopiowano skrócony link." : "Short link copied.");
      setTimeout(() => {
        setCopiedPublicId((current) => (current === publicId ? null : current));
        setAnnounce(null);
      }, 1500);
    } catch {
      const msg = copy.error;
      setError(msg);
      setAnnounce(msg);
    }
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-4 pb-16 pt-4 text-center sm:gap-10 sm:px-6 sm:pb-20 sm:pt-8">
        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl">
            <span className="text-primary">{siteLang === "pl" ? "Historia" : "History"}</span> {siteLang === "pl" ? "skróconych linków" : "of short links"}
          </h1>
          <p className="mx-auto max-w-3xl text-base leading-7 text-muted sm:text-lg sm:leading-9">
            {copy.description}
          </p>
        </div>

        {error ? (
          <p id="history-error" role="alert" className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-left text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        ) : null}
        <div role="status" aria-live="polite" className="sr-only">
          {announce}
        </div>

        {!hasItems ? (
          <section aria-labelledby="history-empty-title" className="w-full rounded-3xl border border-slate-200 bg-surface p-6 text-sm text-muted shadow-sm dark:border-slate-700">
            <h2 id="history-empty-title" className="mb-2 text-lg font-bold text-foreground">
              {copy.emptyTitle}
            </h2>
            <p>{copy.emptyDescription}</p>
          </section>
        ) : null}

        {hasItems ? (
          <ul className="w-full space-y-3 text-left" aria-label={copy.listLabel}>
            {items.map((item) => (
              <li key={item.publicId}>
                <article className="rounded-3xl border border-slate-200 bg-surface p-4 shadow-sm dark:border-slate-700">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-2 text-sm">
                      <h2 className="truncate text-base font-semibold text-foreground">/{item.code}</h2>
                      <p className="truncate text-muted" title={item.url}>
                        {item.url}
                      </p>
                      <p className="text-xs text-muted">
                        {copy.createdAt} {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 sm:pl-4">
                      <a
                        href={item.statsUrl}
                        className="inline-flex min-h-11 flex-none items-center rounded-xl border border-primary/40 bg-primary/10 px-5 text-sm font-semibold text-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-primary/20 sm:px-3 sm:py-2"
                      >
                        {copy.stats}
                      </a>
                      <button
                        type="button"
                        onClick={() => copyShortUrl(item.publicId, item.shortUrl)}
                        className="inline-flex min-h-11 flex-none items-center rounded-xl border border-primary/40 bg-primary/10 px-5 text-sm font-semibold text-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-primary/20 sm:px-3 sm:py-2"
                      >
                        {copiedPublicId === item.publicId ? copy.copied : copy.copy}
                      </button>
                      <a
                        href={item.qrDownloadUrl}
                        download={`qr-${item.code}.jpg`}
                        className="inline-flex min-h-11 flex-none items-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:opacity-90 sm:px-3 sm:py-2"
                      >
                        {copy.downloadQr}
                      </a>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : null}
      </main>
    </div>
  );
}
