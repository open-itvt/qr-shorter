"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CopyableLinkRow from "@/app/components/copyable-link-row";
import SiteHeader from "@/app/components/site-header";

type ApiResult = {
  code: string;
  publicId: string;
  url: string;
  shortUrl: string;
  qrUrl: string;
  statsUrl: string;
  expiresAt: string | null;
  stats: StatsResult;
};

type StatsResult = {
  publicId: string;
  url: string;
  createdAt: string;
  lastAccessedAt: string | null;
  totalClicks: number;
  qrScans: number;
  expiresAt: string | null;
};

function buildExpiresAt(expiryMode: "none" | "date" | "days", expiryDate: string, expiryDays: string): string | null {
  if (expiryMode === "none") {
    return null;
  }

  if (expiryMode === "date") {
    if (!expiryDate) {
      throw new Error("Wybierz datę wygaśnięcia.");
    }

    const parsed = new Date(`${expiryDate}T23:59:59.999`);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Wybierz poprawną datę wygaśnięcia.");
    }

    return parsed.toISOString();
  }

  const days = Number.parseInt(expiryDays, 10);
  if (!Number.isFinite(days) || days < 1) {
    throw new Error("Podaj poprawną liczbę dni ważności.");
  }

  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export default function HomePageClient() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isOtherFunctionsOpen, setIsOtherFunctionsOpen] = useState(false);
  const [customCode, setCustomCode] = useState("");
  const [expiryMode, setExpiryMode] = useState<"none" | "date" | "days">("none");
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryDays, setExpiryDays] = useState("7");
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    const preferred =
      localStorage.getItem("theme") ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    return preferred === "dark" ? "dark" : "light";
  });
  const [result, setResult] = useState<ApiResult | null>(null);
  const [stats, setStats] = useState<StatsResult | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (retryAfter === null || retryAfter <= 0) return;

    const timer = setInterval(() => {
      setRetryAfter((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [retryAfter]);

  const formattedStats = useMemo(() => {
    if (!stats) {
      return null;
    }
    return {
      created: new Date(stats.createdAt).toLocaleString(),
      lastAccessed: stats.lastAccessedAt ? new Date(stats.lastAccessedAt).toLocaleString() : "Never",
      expiresAt: stats.expiresAt ? new Date(stats.expiresAt).toLocaleString() : null,
    };
  }, [stats]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
  };

  const loadStats = async (publicId: string) => {
    setIsLoadingStats(true);
    try {
      const response = await fetch(`/api/public-stats/${publicId}`, {cache: "no-store"});
      if (!response.ok) {
        throw new Error("Failed to load statistics.");
      }
      const payload = (await response.json()) as StatsResult;
      setStats(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to fetch statistics.");
    } finally {
      setIsLoadingStats(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStats(null);
    setResult(null);
    setIsOtherFunctionsOpen(false);
    setIsLoading(true);

    try {
      const expiresAt = buildExpiresAt(expiryMode, expiryDate, expiryDays);
      const trimmedCustomCode = customCode.trim();
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          url,
          customCode: trimmedCustomCode.length > 0 ? trimmedCustomCode : undefined,
          expiresAt,
        }),
      });
      const payload = await response.json();

      if (response.status === 429) {
        const message = payload.error || "Przekroczono limit. Spróbuj ponownie za chwilę.";
        setError(message);
        setRetryAfter(payload.retryAfter || 30);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error ?? "Nie udało się skrócić URL.");
      }

      const nextResult = payload as ApiResult;
      setResult(nextResult);
      setStats(nextResult.stats);
      setUrl("");
      try {
        const historyItem = {
          publicId: nextResult.publicId,
          code: nextResult.code,
          url: nextResult.url,
          createdAt: new Date().toISOString(),
          shortUrl: nextResult.shortUrl,
          statsUrl: nextResult.statsUrl,
          qrDownloadUrl: `${nextResult.qrUrl}?format=jpg&download=1`,
          expiresAt: nextResult.expiresAt,
        };
        const stored = localStorage.getItem("qr-history");
        const history = stored ? JSON.parse(stored) : [];
        const updated = [historyItem, ...history].slice(0, 100);
        localStorage.setItem("qr-history", JSON.stringify(updated));
      } catch {
        // Silent fail for localStorage
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Coś poszło nie tak.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      {/* Use shared SiteHeader so language toggle appears consistently */}
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-4 pb-16 pt-4 text-center sm:gap-10 sm:px-6 sm:pb-20 sm:pt-8">
        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl">
            <span className="text-primary">Skracaj</span>, licz, {" "}
            <span className="text-primary">dziel się</span>
          </h1>
          <p className="mx-auto max-w-3xl text-base leading-7 text-muted sm:text-lg sm:leading-9">
            {/* Localized paragraph */}
            <Localized
              en="Shorten long URLs, generate QR codes, and measure clicks and scans from one place."
              pl="Skróć długie adresy URL, generuj kody QR i mierz kliknięcia oraz skany w jednym miejscu."
            />
          </p>
        </div>

        <div className="flex w-full flex-col items-center">
          <form
            onSubmit={onSubmit}
            className="flex w-full max-w-3xl flex-col gap-3 rounded-t-3xl border border-slate-200 border-b-0 bg-surface p-3 pb-10 sm:gap-4 sm:rounded-t-4xl sm:border-b sm:p-4 md:rounded-4xl dark:border-slate-700"
          >
            <div className="flex w-full flex-col items-center gap-3 md:flex-row md:gap-2">
              <input
                type="url"
                required
                placeholder="Wrzuć długi link, aby go skrócić..."
                autoComplete="url"
                autoCorrect="off"
                spellCheck={false}
                className="w-full min-h-12 min-w-0 flex-1 rounded-full border border-slate-200 bg-white p-5 text-base outline-none transition focus:border-primary sm:min-h-14 sm:px-6 dark:border-slate-700 dark:bg-slate-900"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 h-12 w-full rounded-full bg-primary px-6 text-base font-semibold text-white shadow-lg shadow-green-500/30 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:mt-0 sm:h-14 sm:w-auto sm:px-8 sm:text-lg"
              >
                {isLoading ? "Skracam..." : "Skróć link"}
              </button>
            </div>

            {error ? (
              <p className="text-left text-sm font-medium text-red-500">
                {retryAfter
                  ? `Error: Przekroczono limit. Spróbuj ponownie za ${retryAfter >= 60 ? `${Math.floor((retryAfter ?? 0) / 60)}m` : `${retryAfter}s`}.`
                  : error}
              </p>
            ) : null}

            <div
              id="content-options"
              className={isOtherFunctionsOpen ? "mt-3 flex w-full max-w-3xl flex-col items-center rounded-3xl border border-slate-200 bg-surface p-4 text-center dark:border-slate-700" : "hidden"}
            >
              <h2 className="mb-4 text-center text-xl font-bold">Więcej funkcji</h2>

              <div
                className="mb-2 text-base font-bold tracking-wide text-slate-500 dark:text-slate-400"
                style={{fontFamily: "Roboto, sans-serif"}}
              >
                Własny adres URL (min. 5 znaków, max. 30)
              </div>

              <div className="flex w-full max-w-md items-center justify-center gap-2">
                <label className="shrink-0 cursor-pointer whitespace-nowrap text-sm font-semibold">
                  go.itvt.xyz/
                </label>
                <input
                  type="text"
                  placeholder="wlasny_url"
                  minLength={5}
                  maxLength={30}
                  style={{colorScheme: theme}}
                  value={customCode}
                  onChange={(event) => setCustomCode(event.target.value)}
                  className="min-w-0 w-full max-w-xs flex-1 rounded-full border border-slate-200 bg-white p-3 text-base outline-none transition focus:border-primary sm:px-6 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div
                className="mt-4 mb-2 text-base font-bold tracking-wide text-slate-500 dark:text-slate-400"
                style={{fontFamily: "Roboto, sans-serif"}}
              >
                Ograniczenia czasowe
              </div>

              <div className="flex flex-col justify-center items-center w-full max-w-md rounded-2xl border border-slate-200 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/60">
                <div className="mb-3 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() => setExpiryMode("none")}
                    className={`rounded-full px-3 py-2 transition ${expiryMode === "none" ? "bg-primary text-white" : "border border-slate-200 bg-transparent text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}
                  >
                    Bez limitu
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiryMode("date")}
                    className={`rounded-full px-3 py-2 transition ${expiryMode === "date" ? "bg-primary text-white" : "border border-slate-200 bg-transparent text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}
                  >
                    Data
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiryMode("days")}
                    className={`rounded-full px-3 py-2 transition ${expiryMode === "days" ? "bg-primary text-white" : "border border-slate-200 bg-transparent text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}
                  >
                    Dni
                  </button>
                </div>

                {expiryMode === "none" ? null : expiryMode === "date" ? (
                  <div className="flex w-70 items-center justify-center gap-2">
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(event) => setExpiryDate(event.target.value)}
                      style={{colorScheme: theme}}
                      className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white p-4 text-base outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                ) : (
                  <div className="flex w-40 items-center justify-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={expiryDays}
                      onChange={(event) => setExpiryDays(event.target.value)}
                      style={{colorScheme: theme}}
                      className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white p-4 text-base outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-900"
                    />
                    <span className="shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
                      dni
                    </span>
                  </div>
                )}
              </div>
            </div>
          </form>

          <div className="grid w-full grid-cols-5">
            <div className="hidden md:flex justify-end z-2 col-span-2">
              <div className="bg-surface -mt-px -mr-px h-[50%] w-[50%]">
                <div className="bg-background rounded-tr-3xl border-r border-t border-slate-200 h-full w-full dark:border-slate-700"></div>
              </div>
            </div>
            <div className="z-1 -mt-px flex h-10 w-full col-span-5 items-center justify-center rounded-b-3xl border border-t-0 border-slate-200 bg-white px-6 dark:border-slate-700 dark:bg-slate-900 md:col-span-1">
              <button
                type="button"
                onClick={() => setIsOtherFunctionsOpen((current) => !current)}
                aria-expanded={isOtherFunctionsOpen}
                className="flex h-full w-full items-center justify-center gap-1 text-sm font-semibold sm:w-auto"
              >
                Inne funkcje
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-4 w-4 transition-transform ${isOtherFunctionsOpen ? "rotate-90" : "rotate-0"}`}
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
            <div className="hidden md:flex justify-start z-2 col-span-2">
              <div className="bg-surface -mt-px -ml-px h-[50%] w-[50%]">
                <div className="bg-background rounded-tl-3xl border-l border-t border-slate-200 h-full w-full dark:border-slate-700"></div>
              </div>
            </div>
          </div>
        </div>

        {result ? (
          <section className="grid w-full max-w-4xl gap-4 md:grid-cols-[1.2fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-surface p-4 text-left sm:p-6 dark:border-slate-700">
              <h2 className="mb-4 text-xl font-bold">Short link</h2>
              <div className="space-y-3 text-sm">
                <CopyableLinkRow
                  label="Short:"
                  value={result.shortUrl}
                  href={result.shortUrl}
                  copyLabel="short link"
                />
                <CopyableLinkRow label="Original:" value={result.url} copyLabel="original URL" />
                <CopyableLinkRow
                  label="Stats (do not share public):"
                  value={result.statsUrl}
                  href={result.statsUrl}
                  copyLabel="stats URL"
                />
              </div>
              <button
                type="button"
                onClick={() => loadStats(result.publicId)}
                disabled={isLoadingStats}
                className="mt-6 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:bg-slate-100 disabled:opacity-70 dark:border-slate-600 dark:hover:bg-slate-800"
              >
                {isLoadingStats ? "Refreshing..." : "Refresh stats"}
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-surface p-4 shadow-sm sm:p-6 dark:border-slate-700">
              <h2 className="mb-4 text-xl font-bold">QR code</h2>
              <Image
                src={`/api/qr/${result.code}`}
                alt={`QR code for ${result.shortUrl}`}
                width={224}
                height={224}
                unoptimized
                className="mx-auto h-auto w-full max-w-56 rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-700"
              />
              <a
                href={`/api/qr/${result.code}?format=jpg&download=1`}
                download={`qr-${result.code}.jpg`}
                className="mt-4 inline-flex rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
              >
                Download QR (JPG)
              </a>
            </div>
          </section>
        ) : null}

        {stats && formattedStats ? (
          <section className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-surface p-4 text-left shadow-sm sm:p-6 dark:border-slate-700">
            <h2 className="mb-4 text-xl font-bold">Statistics</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <p>
                <span className="font-semibold">Total redirects:</span> {stats.totalClicks}
              </p>
              <p>
                <span className="font-semibold">QR scans:</span> {stats.qrScans}
              </p>
              <p>
                <span className="font-semibold">Created at:</span> {formattedStats.created}
              </p>
              <p>
                <span className="font-semibold">Last accessed:</span> {formattedStats.lastAccessed}
              </p>
              {formattedStats.expiresAt ? (
                <p>
                  <span className="font-semibold">Expires at:</span> {formattedStats.expiresAt}
                </p>
              ) : null}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
