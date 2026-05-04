"use client";

import { useEffect, useState, useRef } from "react";

type AutoRedirectProps = {
  targetUrl: string;
  delaySeconds?: number;
};

export default function AutoRedirect({ targetUrl, delaySeconds = 5 }: AutoRedirectProps) {
  const [countdown, setCountdown] = useState(delaySeconds);
  const [cancelled, setCancelled] = useState(false);
  const announcerRef = useRef<HTMLDivElement | null>(null);

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
      announcerRef.current.textContent = `Redirecting in ${countdown} seconds`;
    }
  }, [countdown]);

  return (
    <div role="region" aria-label="Redirect notice" className="w-full">
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-surface p-6 shadow-sm dark:border-slate-700">
        <h1 className="text-3xl font-extrabold text-primary sm:text-4xl">URL Shorter</h1>
        <p className="text-base text-muted">You are being redirected to the target page.</p>
        <p className="break-all text-sm text-muted">
          If redirect does not happen automatically, open{' '}
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
            Proceed now
          </button>
          <button
            type="button"
            onClick={() => setCancelled(true)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold"
          >
            Stay on this page
          </button>
          <div className="sr-only" role="status" aria-live="polite" ref={announcerRef}></div>
        </div>
      </div>
    </div>
  );
}
