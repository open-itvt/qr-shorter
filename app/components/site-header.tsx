"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import pl from "@/locales/pl.json";

type SiteHeaderProps = {
  showHistoryLink?: boolean;
};

export default function SiteHeader({ showHistoryLink = true }: SiteHeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    const preferred =
      localStorage.getItem("theme") ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    return preferred === "dark" ? "dark" : "light";
  });

  const [lang, setLang] = useState<"pl" | "en">(() => {
    if (typeof window === "undefined") return "pl";
    try {
      const stored = localStorage.getItem("site-language");
      if (stored === "pl" || stored === "en") return stored;
    } catch {}
    return navigator.language?.startsWith("pl") ? "pl" : "en";
  });

  useEffect(() => {
    try {
      document.documentElement.lang = lang;
    } catch {}
    try {
      localStorage.setItem("site-language", lang);
      // also set a cookie so server-side can read preferred language
      try {
        document.cookie = `site-language=${lang}; path=/; max-age=${60 * 60 * 24 * 365}`;
      } catch {}
    } catch {}
  }, [lang]);

  const labels =
    lang === "pl"
      ? pl
      : {
          openHistory: "Open history",
          history: "History",
          historyTitle: "History",
          switchToEnglish: "Switch to English",
          switchToPolish: "Switch to Polish",
          pl: "PL",
          en: "EN",
          switchTheme: "Switch theme",
        };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6 sm:py-8">
      <Link href="/" className="text-3xl font-extrabold text-primary sm:text-4xl">
        QR Shorter
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        {showHistoryLink ? (
          <>
            <button
              type="button"
              onClick={() => {
                const next = lang === "pl" ? "en" : "pl";
                setLang(next);
                try {
                  localStorage.setItem("site-language", next);
                } catch {}
                try {
                  document.cookie = `site-language=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
                } catch {}
                // reload to ensure single-language rendering across app
                window.location.reload();
              }}
              aria-label={lang === "pl" ? labels.switchToEnglish : labels.switchToPolish}
              title={lang === "pl" ? labels.pl : labels.en}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {lang === "pl" ? labels.pl : labels.en}
            </button>

            <Link
              href="/history"
              aria-label={lang === "pl" ? labels.openHistory : labels.openHistory}
              title={lang === "pl" ? labels.historyTitle : labels.historyTitle}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-primary transition hover:bg-primary/20 dark:border-primary/45"
            >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 3v6h6" />
              <path d="M12 7v5l3 3" />
            </svg>
          </Link>
          </>
        ) : null}
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          {lang === "pl" ? pl.switchTheme : "Switch theme"}
        </button>
      </div>
    </header>
  );
}

