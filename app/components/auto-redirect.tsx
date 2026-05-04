"use client";

import { useEffect, useState, useRef } from "react";

type AutoRedirectProps = {
  targetUrl: string;
  delaySeconds?: number;
  lang?: "pl" | "en";
};

export default function AutoRedirect({ targetUrl, delaySeconds = 5, lang = "en" }: AutoRedirectProps) {
  const [countdown, setCountdown] = useState(delaySeconds);
  const [cancelled, setCancelled] = useState(false);
  const announcerRef = useRef<HTMLDivElement | null>(null);

  const copy = {
    title: lang === "pl" ? "Przekierowanie" : "Redirecting",
    description: lang === "pl" ? "Za chwilę nastąpi przekierowanie do docelowej strony." : "You are being redirected to the target page.",
    fallback: lang === "pl" ? "Jeśli przekierowanie nie nastąpi automatycznie, użyj linku poniżej." : "If redirect does not happen automatically, use the link below.",
    proceed: lang === "pl" ? "Przejdź teraz" : "Proceed now",
    stay: lang === "pl" ? "Zostań na tej stronie" : "Stay on this page",
    cancelled: lang === "pl" ? "Przekierowanie wstrzymane." : "Redirect paused.",
    announce: (seconds: number) => (lang === "pl" ? `Przekierowanie nastąpi za ${seconds} s.` : `Redirecting in ${seconds} seconds.`),
  };

  useEffect(() => {
    if (cancelled) return;
    if (countdown <= 0) {
      try {
        window.location.replace(targetUrl);
      } catch {}
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, cancelled, targetUrl]);

  useEffect(() => {
    if (announcerRef.current) {
      announcerRef.current.textContent = countdown > 0 ? copy.announce(countdown) : copy.description;
    }
  }, [countdown, copy.description]);

  return (
    <div role="region" aria-label={copy.title} className="w-full">
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-surface p-6 shadow-sm dark:border-slate-700">
        <h1 className="text-3xl font-extrabold text-primary sm:text-4xl">URL Shorter</h1>
        <p className="text-base text-muted">{cancelled ? copy.cancelled : copy.description}</p>
        <p className="break-all text-sm text-muted">
          {copy.fallback}{" "}
          <a className="text-primary underline" href={targetUrl}>
            {targetUrl}
          </a>
          .
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              try {
                window.location.replace(targetUrl);
              } catch {}
            }}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            {copy.proceed}
          </button>
          <button
            type="button"
            onClick={() => setCancelled(true)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold"
          >
            {copy.stay}
          </button>
          <div className="sr-only" role="status" aria-live="polite" ref={announcerRef}></div>
        </div>
      </div>
    </div>
  );
}
