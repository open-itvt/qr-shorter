"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useRef } from "react";

type LanguageCode = "pl" | "en";
type ContrastMode = "default" | "high" | "extra";
type FontMode = "default" | "readable" | "serif";

type LanguageAccessibilityModalLabels = {
  title: string;
  description: string;
  chooseLanguage: string;
  chooseContrast: string;
  chooseFont: string;
  close: string;
  reset: string;
  polish: string;
  english: string;
  currentLanguage: string;
  reloadNote: string;
  current: string;
  contrastDefault: string;
  contrastYellow: string;
  contrastMono: string;
  fontDefault: string;
  fontReadable: string;
  fontSerif: string;
};

type LanguageAccessibilityModalProps = {
  isOpen: boolean;
  currentLanguage: LanguageCode;
  currentContrast: ContrastMode;
  currentFont: FontMode;
  labels: LanguageAccessibilityModalLabels;
  onClose: () => void;
  onSelectLanguage: (language: LanguageCode) => void;
  onSelectContrast: (contrast: ContrastMode) => void;
  onSelectFont: (font: FontMode) => void;
};

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function TinyContrastIcon({ mode }: { mode: ContrastMode }) {
  if (mode === "high") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 shrink-0">
        <circle cx="10" cy="10" r="7" fill="#FACC15" stroke="#A16207" strokeWidth="1.2" />
        <path d="M10 4.5v11" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (mode === "extra") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 shrink-0">
        <circle cx="10" cy="10" r="7" fill="#111111" stroke="#E5E7EB" strokeWidth="1.2" />
        <path d="M6.8 10h6.4" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 shrink-0">
      <circle cx="10" cy="10" r="7" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
      <path d="M6.8 10h6.4" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function TinyFontIcon({ mode }: { mode: FontMode }) {
  if (mode === "readable") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 shrink-0">
        <text x="3" y="13.5" fontSize="10" fontFamily="Verdana, Arial, sans-serif" fontWeight="700" fill="currentColor">
          Aa
        </text>
      </svg>
    );
  }

  if (mode === "serif") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 shrink-0">
        <text x="3" y="13.5" fontSize="10" fontFamily="Georgia, Cambria, 'Times New Roman', serif" fontWeight="700" fill="currentColor">
          Aa
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 shrink-0">
      <text x="3" y="13.5" fontSize="10" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fill="currentColor">
        Aa
      </text>
    </svg>
  );
}

export default function LanguageAccessibilityModal({
  isOpen,
  currentLanguage,
  currentContrast,
  currentFont,
  labels,
  onClose,
  onSelectLanguage,
  onSelectContrast,
  onSelectFont,
}: LanguageAccessibilityModalProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const dialog = dialogRef.current;
    const overlay = overlayRef.current;
    if (!dialog || !overlay) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const hiddenNodes = new Map<Element, { ariaHidden: string | null }>();

    for (const child of Array.from(document.body.children)) {
      if (child === overlay) {
        continue;
      }

      hiddenNodes.set(child, { ariaHidden: child.getAttribute("aria-hidden") });
      child.setAttribute("aria-hidden", "true");
      child.setAttribute("inert", "");
    }

    document.body.style.overflow = "hidden";

    const focusFirstElement = () => {
      const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => !element.hasAttribute("disabled") && element.tabIndex !== -1,
      );
      focusables[0]?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => !element.hasAttribute("disabled") && element.tabIndex !== -1,
      );

      if (focusables.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!active || active === first || !dialog.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (!active || active === last || !dialog.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    const timeoutId = window.setTimeout(focusFirstElement, 0);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;

      for (const [node, state] of hiddenNodes.entries()) {
        if (state.ariaHidden === null) {
          node.removeAttribute("aria-hidden");
        } else {
          node.setAttribute("aria-hidden", state.ariaHidden);
        }
        node.removeAttribute("inert");
      }

      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-2 sm:items-center sm:p-4 lg:p-6">
      <button
        type="button"
        aria-label={labels.close}
        className="absolute inset-0 cursor-default bg-slate-950/60 focus-visible:outline-none"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        id="language-accessibility-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative z-10 my-2 max-h-[calc(100dvh-1rem)] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-surface p-4 text-left shadow-2xl dark:border-slate-700 sm:my-0 sm:p-6 lg:p-7"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/90 dark:text-primary sm:text-sm">{labels.chooseLanguage}</p>
            <h2 id={titleId} className="text-xl font-extrabold leading-tight text-foreground dark:text-white sm:text-2xl">
              {labels.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
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
              <path d="M18 6 6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p id={descriptionId} className="mt-3 max-w-3xl text-sm leading-6 text-slate-700 dark:text-slate-200 sm:text-[15px]">
          {labels.description}
        </p>

        <div className="mt-4 space-y-5 sm:mt-5 sm:space-y-6">
          <section className="space-y-3" aria-labelledby="language-section-title">
            <h3 id="language-section-title" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300 sm:text-sm">
              {labels.chooseLanguage}
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => onSelectLanguage("pl")}
                aria-pressed={currentLanguage === "pl"}
                className="flex min-h-18 flex-col justify-between gap-2.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-3.5 text-left text-sm font-semibold text-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 sm:min-h-20 sm:px-4 sm:py-4"
              >
                <span className="block text-[15px] leading-5 text-slate-900 dark:text-white sm:text-base">{labels.polish}</span>
                <span className="block text-[11px] font-medium leading-4 text-slate-500 dark:text-slate-300 sm:text-xs">
                  {currentLanguage === "pl" ? labels.currentLanguage : labels.reloadNote}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectLanguage("en")}
                aria-pressed={currentLanguage === "en"}
                className="flex min-h-18 flex-col justify-between gap-2.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-3.5 text-left text-sm font-semibold text-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 sm:min-h-20 sm:px-4 sm:py-4"
              >
                <span className="block text-[15px] leading-5 text-slate-900 dark:text-white sm:text-base">{labels.english}</span>
                <span className="block text-[11px] font-medium leading-4 text-slate-500 dark:text-slate-300 sm:text-xs">
                  {currentLanguage === "en" ? labels.currentLanguage : labels.reloadNote}
                </span>
              </button>
            </div>
          </section>

          <section className="space-y-3" aria-labelledby="contrast-section-title">
            <h3 id="contrast-section-title" className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">
              {labels.chooseContrast}
            </h3>
            <div className="grid gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={() => onSelectContrast("default")}
                aria-pressed={currentContrast === "default"}
                className="flex min-h-20 flex-col justify-between gap-2 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-100 px-3 py-3 text-left text-sm font-semibold text-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:from-slate-50 hover:to-slate-100 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 dark:text-slate-100 sm:min-h-22 sm:px-4 sm:py-4"
              >
                <div className="space-y-1">
                  <span className="block text-[14px] leading-5 text-slate-900 dark:text-white sm:text-base">{labels.contrastDefault}</span>
                  <span className="block text-[11px] font-medium leading-4 text-slate-500 dark:text-slate-300 sm:text-xs">{currentContrast === "default" ? labels.current : labels.reloadNote}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <TinyContrastIcon mode="default" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">Aa</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectContrast("high")}
                aria-pressed={currentContrast === "high"}
                className="flex min-h-20 flex-col justify-between gap-2 rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-200 px-3 py-3 text-left text-sm font-semibold text-amber-950 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:from-amber-100 hover:to-amber-200 dark:border-amber-300/50 dark:bg-gradient-to-br dark:from-amber-300/15 dark:via-yellow-300/10 dark:to-amber-500/15 dark:text-amber-100 sm:min-h-22 sm:px-4 sm:py-4"
              >
                <div className="space-y-1">
                  <span className="block text-[14px] leading-5 text-amber-950 dark:text-amber-100 sm:text-base">{labels.contrastYellow}</span>
                  <span className="block text-[11px] font-medium leading-4 text-amber-950/75 dark:text-amber-100/80 sm:text-xs">{currentContrast === "high" ? labels.current : labels.reloadNote}</span>
                </div>
                <div className="flex items-center gap-2 text-amber-950/75 dark:text-amber-100/75">
                  <TinyContrastIcon mode="high" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">Aa</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectContrast("extra")}
                aria-pressed={currentContrast === "extra"}
                className="flex min-h-20 flex-col justify-between gap-2 rounded-2xl border border-slate-300 bg-gradient-to-br from-black via-slate-950 to-white px-3 py-3 text-left text-sm font-semibold text-slate-950 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:from-slate-900 hover:to-slate-100 dark:border-slate-200/40 dark:bg-gradient-to-br dark:from-black dark:via-black dark:to-white dark:text-white sm:min-h-22 sm:px-4 sm:py-4"
              >
                <div className="space-y-1">
                  <span className="block text-[14px] leading-5 text-white sm:text-base">{labels.contrastMono}</span>
                  <span className="block text-[11px] font-medium leading-4 text-slate-700/80 dark:text-slate-200/80 sm:text-xs">{currentContrast === "extra" ? labels.current : labels.reloadNote}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <TinyContrastIcon mode="extra" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">Aa</span>
                </div>
              </button>
            </div>
          </section>

          <section className="space-y-3" aria-labelledby="font-section-title">
            <h3 id="font-section-title" className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">
              {labels.chooseFont}
            </h3>
            <div className="grid gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={() => onSelectFont("default")}
                aria-pressed={currentFont === "default"}
                className="flex min-h-20 flex-col justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left text-sm font-semibold text-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 sm:min-h-22 sm:px-4 sm:py-4"
              >
                <div className="space-y-1">
                  <span className="block text-[14px] leading-5 text-slate-900 dark:text-white sm:text-base">{labels.fontDefault}</span>
                  <span className="block text-[11px] font-medium leading-4 text-slate-500 dark:text-slate-300 sm:text-xs">{currentFont === "default" ? labels.current : labels.reloadNote}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <TinyFontIcon mode="default" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">Aa</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectFont("readable")}
                aria-pressed={currentFont === "readable"}
                className="flex min-h-20 flex-col justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left text-sm font-semibold text-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 sm:min-h-22 sm:px-4 sm:py-4"
              >
                <div className="space-y-1">
                  <span className="block text-[14px] leading-5 text-slate-900 dark:text-white sm:text-base">{labels.fontReadable}</span>
                  <span className="block text-[11px] font-medium leading-4 text-slate-500 dark:text-slate-300 sm:text-xs">{currentFont === "readable" ? labels.current : labels.reloadNote}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <TinyFontIcon mode="readable" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">Aa</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectFont("serif")}
                aria-pressed={currentFont === "serif"}
                className="flex min-h-20 flex-col justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left text-sm font-semibold text-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 sm:min-h-22 sm:px-4 sm:py-4"
              >
                <div className="space-y-1">
                  <span className="block text-[14px] leading-5 text-slate-900 dark:text-white sm:text-base">{labels.fontSerif}</span>
                  <span className="block text-[11px] font-medium leading-4 text-slate-500 dark:text-slate-300 sm:text-xs">{currentFont === "serif" ? labels.current : labels.reloadNote}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <TinyFontIcon mode="serif" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">Aa</span>
                </div>
              </button>
            </div>
          </section>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-slate-700 dark:text-slate-200 sm:text-[15px]">{labels.description}</p>
            <button
              type="button"
              onClick={() => {
                onSelectContrast("default");
                onSelectFont("default");
              }}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 sm:w-auto"
            >
              {labels.reset}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}