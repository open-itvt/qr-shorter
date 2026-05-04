"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import pl from "@/locales/pl.json";
import LanguageAccessibilityModal from "@/app/components/language-accessibility-modal";

type SiteHeaderProps = {
  showHistoryLink?: boolean;
};

type ContrastMode = "default" | "high" | "extra";
type FontMode = "default" | "readable" | "serif";

const englishLabels = {
  openHistory: "Open history",
  historyTitle: "History",
  switchTheme: "Switch theme",
  accessibility: {
    open: "Open accessibility settings",
    title: "Accessibility settings",
    description: "Choose the interface language, contrast, and font. Language changes refresh the page; visual settings apply instantly.",
    chooseLanguage: "Choose interface language",
    chooseContrast: "Choose contrast mode",
    chooseFont: "Choose font style",
    chooseFontSize: "Choose font size",
    close: "Close language dialog",
    reset: "Reset accessibility settings",
    polish: "Polish",
    english: "English",
    currentLanguage: "Current language",
    current: "Current",
    reloadNote: "Click to change",
    contrastDefault: "Standard",
    contrastYellow: "Yellow",
    contrastMono: "Black and white",
    fontDefault: "Default",
    fontReadable: "Readable",
    fontSerif: "Serif",
  },
} as const;

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

  const [contrast, setContrast] = useState<ContrastMode>(() => {
    if (typeof window === "undefined") return "default";

    try {
      const stored = localStorage.getItem("contrast-mode");
      if (stored === "default" || stored === "high" || stored === "extra") return stored;
    } catch {}

    return window.matchMedia("(prefers-contrast: more)").matches ? "high" : "default";
  });

  const [font, setFont] = useState<FontMode>(() => {
    if (typeof window === "undefined") return "default";

    try {
      const stored = localStorage.getItem("font-mode");
      if (stored === "default" || stored === "readable" || stored === "serif") return stored;
    } catch {}

    return "default";
  });

  const [fontSize, setFontSize] = useState<number>(() => {
    if (typeof window === "undefined") return 100;

    try {
      const stored = Number(localStorage.getItem("font-size"));
      if (Number.isFinite(stored) && stored >= 80 && stored <= 200) return stored;
    } catch {}

    return 100;
  });

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

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

  const labels = lang === "pl" ? pl : englishLabels;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (contrast === "default") {
      root.removeAttribute("data-contrast");
    } else {
      root.setAttribute("data-contrast", contrast);
    }
    localStorage.setItem("contrast-mode", contrast);
  }, [contrast]);

  useEffect(() => {
    const root = document.documentElement;
    if (font === "default") {
      root.removeAttribute("data-font");
    } else {
      root.setAttribute("data-font", font);
    }
    localStorage.setItem("font-mode", font);
  }, [font]);

  useEffect(() => {
    const clampedFontSize = Math.min(200, Math.max(80, fontSize));
    document.documentElement.style.fontSize = `${clampedFontSize}%`;
    localStorage.setItem("font-size", String(clampedFontSize));
  }, [fontSize]);

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  const applyLanguage = (next: "pl" | "en") => {
    setLang(next);
    try {
      document.documentElement.lang = next;
    } catch {}
    try {
      localStorage.setItem("site-language", next);
    } catch {}
    try {
      document.cookie = `site-language=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    } catch {}
    setIsLanguageModalOpen(false);
    window.location.reload();
  };

  const applyContrast = (next: ContrastMode) => {
    setContrast(next);
  };

  const applyFont = (next: FontMode) => {
    setFont(next);
  };

  const applyFontSize = (next: number) => {
    setFontSize(Math.min(200, Math.max(80, next)));
  };

  return (
    <>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6 sm:py-8">
        <Link href="/" className="text-3xl font-extrabold text-primary sm:text-4xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md">
          QR Shorter
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {showHistoryLink ? (
            <>
              <button
                type="button"
                onClick={() => setIsLanguageModalOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={isLanguageModalOpen}
                aria-controls="language-accessibility-dialog"
                aria-label={labels.accessibility.open}
                title={labels.accessibility.title}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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
                  <circle cx="12" cy="5" r="1.8" fill="currentColor" stroke="none" />
                  <path d="M12 8.2v11.3" />
                  <path d="M7.2 10.1 12 12.1l4.8-2" />
                  <path d="M9.3 19.5 12 12.1l2.7 7.4" />
                  <path d="M4.5 8.3C6.1 6.1 8.8 4.6 12 4.6s5.9 1.5 7.5 3.7" opacity="0.35" />
                </svg>
              </button>

              <Link
                href="/history"
                aria-label={labels.openHistory}
                title={labels.historyTitle}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-primary/20 dark:border-primary/45"
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
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {lang === "pl" ? pl.switchTheme : labels.switchTheme}
          </button>
        </div>
      </header>

      <LanguageAccessibilityModal
        isOpen={isLanguageModalOpen}
        currentLanguage={lang}
        currentContrast={contrast}
        currentFont={font}
        currentFontSize={fontSize}
        labels={labels.accessibility}
        onClose={() => setIsLanguageModalOpen(false)}
        onSelectLanguage={applyLanguage}
        onSelectContrast={applyContrast}
        onSelectFont={applyFont}
        onSelectFontSize={applyFontSize}
      />
    </>
  );
}

