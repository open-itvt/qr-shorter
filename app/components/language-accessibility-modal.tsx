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
  chooseFontSize: string;
  redirectNotifications: string;
  redirectNotificationsDescription: string;
  disableNotifications: string;
  enableNotifications: string;
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
  currentFontSize: number;
  currentNotificationsEnabled: boolean;
  labels: LanguageAccessibilityModalLabels;
  onClose: () => void;
  onSelectLanguage: (language: LanguageCode) => void;
  onSelectContrast: (contrast: ContrastMode) => void;
  onSelectFont: (font: FontMode) => void;
  onSelectFontSize: (fontSize: number) => void;
  onToggleNotifications: () => void;
};

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function TinyContrastIcon({ mode }: { mode: ContrastMode }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-6 w-6 shrink-0" fill="currentColor" stroke="currentColor">
      <g id="SVGRepo_bgCarrier" strokeWidth="0" />
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
      <g id="SVGRepo_iconCarrier">
        <title>palette</title>
        <g id="Layer_2" data-name="Layer 2">
          <g
            id="invisible_box"
            data-name="invisible box"
            role="img"
            aria-label="Invisible box for layout"
            style={{ opacity: 0, pointerEvents: "none" }}
          >
            <rect width="48" height="48" fill="none" stroke="none" />
          </g>
          <g id="icons_Q2" data-name="icons Q2">
            <path d="M26.6,6H27c8.1,0,15,5.5,15,12S40.4,29,28,29c-3.8,0-5.8,2.2-6.4,4.3a5.5,5.5,0,0,0,2.3,6.1c1,.6,1,1.3.9,1.7a1.2,1.2,0,0,1-1.3.9C11.4,42,6,33,6,24S15.2,6,26.5,6h.1m-.1-4C13,2,2,11.8,2,24s8,22,21.5,22C29,46,31,39,26,36c-.9-.6-1-3,2-3,9,0,18-3,18-15C46,9,37,2,27,2Z" />
            <path d="M21,10a3,3,0,1,0,3,3,2.9,2.9,0,0,0-3-3Z" />
            <path d="M14,15a3,3,0,1,0,3,3,2.9,2.9,0,0,0-3-3Z" />
            <path d="M29,9a3,3,0,1,0,3,3,2.9,2.9,0,0,0-3-3Z" />
            <path d="M36,14a3,3,0,1,0,3,3,2.9,2.9,0,0,0-3-3Z" />
          </g>
        </g>
      </g>
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
  currentFontSize,
  currentNotificationsEnabled,
  labels,
  onClose,
  onSelectLanguage,
  onSelectContrast,
  onSelectFont,
  onSelectFontSize,
  onToggleNotifications,
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
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
      <button
        type="button"
        aria-label={labels.close}
        className="absolute inset-0 cursor-default bg-transparent"
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
        className="relative z-10 w-full max-w-4xl transform overflow-hidden rounded-3xl border border-slate-200 bg-surface p-6 text-left shadow-2xl sm:p-8 dark:border-slate-700"
      >
        <div className="flex items-start justify-between">
          <div className="max-w-[70%]">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-400">{labels.chooseLanguage}</p>
            <h2 id={titleId} className="text-3xl font-bold leading-tight text-foreground">{labels.title}</h2>
            <p id={descriptionId} className="mt-3 text-sm text-muted">{labels.description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="ml-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-surface text-muted hover:bg-surface/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-400 dark:border-slate-700"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor">
              <path d="M18 6 6 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{labels.chooseLanguage}</h3>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onSelectLanguage("pl")}
                  aria-pressed={currentLanguage === "pl"}
                  className={`flex-1 rounded-lg border px-4 py-3 text-left text-sm font-semibold transition ${currentLanguage === "pl" ? "bg-primary text-white border-primary" : "bg-transparent text-foreground border border-slate-200 dark:border-slate-700"}`}
                >
                  <div className="mb-1 text-base">{labels.polish}</div>
                  <div className="text-xs text-muted">{currentLanguage === "pl" ? labels.currentLanguage : labels.reloadNote}</div>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectLanguage("en")}
                  aria-pressed={currentLanguage === "en"}
                  className={`flex-1 rounded-lg border px-4 py-3 text-left text-sm font-semibold transition ${currentLanguage === "en" ? "bg-primary text-white border-primary" : "bg-transparent text-foreground border border-slate-200 dark:border-slate-700"}`}
                >
                  <div className="mb-1 text-base">{labels.english}</div>
                  <div className="text-xs text-muted">{currentLanguage === "en" ? labels.currentLanguage : labels.reloadNote}</div>
                </button>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{labels.chooseContrast}</h3>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => onSelectContrast("default")}
                  aria-pressed={currentContrast === "default"}
                  aria-label={labels.contrastDefault}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border ${currentContrast === "default" ? "border-primary bg-primary text-white" : "border border-slate-200 bg-surface text-foreground dark:border-slate-700"}`}
                  title={labels.contrastDefault}
                >
                  <TinyContrastIcon mode="default" />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectContrast("high")}
                  aria-pressed={currentContrast === "high"}
                  aria-label={labels.contrastYellow}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border ${currentContrast === "high" ? "border-amber-300 bg-amber-400 text-black" : "border-amber-300 bg-amber-50/0 text-foreground"}`}
                  title={labels.contrastYellow}
                >
                  <TinyContrastIcon mode="high" />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectContrast("extra")}
                  aria-pressed={currentContrast === "extra"}
                  aria-label={labels.contrastMono}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border ${currentContrast === "extra" ? "border-white bg-black text-white" : "border border-slate-200 bg-surface text-foreground dark:border-slate-700"}`}
                  title={labels.contrastMono}
                >
                  <TinyContrastIcon mode="extra" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{labels.chooseFont}</h3>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onSelectFont("default")}
                  aria-pressed={currentFont === "default"}
                  className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium ${currentFont === "default" ? "bg-primary text-white border-primary" : "bg-transparent text-foreground border border-slate-200 dark:border-slate-700"}`}
                >
                  {labels.fontDefault}
                </button>
                <button
                  type="button"
                  onClick={() => onSelectFont("readable")}
                  aria-pressed={currentFont === "readable"}
                  className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium ${currentFont === "readable" ? "bg-primary text-white border-primary" : "bg-transparent text-foreground border border-slate-200 dark:border-slate-700"}`}
                >
                  {labels.fontReadable}
                </button>
                <button
                  type="button"
                  onClick={() => onSelectFont("serif")}
                  aria-pressed={currentFont === "serif"}
                  className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium ${currentFont === "serif" ? "bg-primary text-white border-primary" : "bg-transparent text-foreground border border-slate-200 dark:border-slate-700"}`}
                >
                  {labels.fontSerif}
                </button>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{labels.chooseFontSize}</h3>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => onSelectFontSize(100)}
                  aria-pressed={currentFontSize === 100}
                  aria-label="Reset font size to 100%"
                  className={`rounded text-2xl transition ${currentFontSize === 100 ? "text-primary" : "text-muted hover:text-primary"}`}
                >
                  Aa
                </button>
                <button
                  type="button"
                  onClick={() => onSelectFontSize(Math.min(200, currentFontSize + 10))}
                  aria-label="Increase font size by 10%"
                  className="rounded text-3xl font-bold text-muted transition hover:text-primary"
                >
                  A+
                </button>
                <button
                  type="button"
                  onClick={() => onSelectFontSize(Math.max(80, currentFontSize - 10))}
                  aria-label="Decrease font size by 10%"
                  className="rounded text-xl text-muted transition hover:text-primary"
                >
                  A-
                </button>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 text-sm text-slate-400">
                <p className="font-semibold text-foreground">{labels.redirectNotifications}</p>
                <p>{labels.redirectNotificationsDescription}</p>
              </div>
              <div className="flex flex-col gap-3 sm:items-end">
                <button
                  type="button"
                  onClick={onToggleNotifications}
                  role="switch"
                  aria-checked={currentNotificationsEnabled}
                  aria-label={labels.redirectNotifications}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${currentNotificationsEnabled ? "border-emerald-500 bg-emerald-500" : "border-red-500 bg-red-500"}`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${currentNotificationsEnabled ? "translate-x-7" : "translate-x-1"}`}
                  />
                </button>
                <p className="text-xs font-medium text-muted sm:text-right">
                  {currentNotificationsEnabled ? labels.disableNotifications : labels.enableNotifications}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onSelectContrast("default");
                    onSelectFont("default");
                  }}
                  className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                >
                  {labels.reset}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
