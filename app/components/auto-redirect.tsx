"use client";

import { useEffect, useState, useRef } from "react";

const REDIRECT_NOTIFICATIONS_STORAGE_KEY = "redirect-notifications";
const REDIRECT_NOTIFICATIONS_CHANGE_EVENT = "redirect-notifications-change";

type AutoRedirectProps = {
  targetUrl: string;
  message?: string | null;
  delaySeconds?: number;
  lang?: "pl" | "en";
};

export default function AutoRedirect({ targetUrl, message, delaySeconds = 5, lang = "en" }: AutoRedirectProps) {
  const [countdown, setCountdown] = useState(delaySeconds);
  const [cancelled, setCancelled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const announcerRef = useRef<HTMLDivElement | null>(null);
  const shouldShowPage = notificationsEnabled;

  const copy = {
    title: lang === "pl" ? "Przekierowanie" : "Redirecting",
    description: lang === "pl" ? "Za chwilę nastąpi przekierowanie do docelowej strony." : "You are being redirected to the target page.",
    fallback: lang === "pl" ? "Jeśli przekierowanie nie nastąpi automatycznie, użyj linku poniżej." : "If redirect does not happen automatically, use the link below.",
    proceed: lang === "pl" ? "Przejdź teraz" : "Proceed now",
    stay: lang === "pl" ? "Zostań na tej stronie" : "Stay on this page",
    disableNotifications: lang === "pl" ? "Wyłącz powiadomienia" : "Disable notifications",
    enableNotifications: lang === "pl" ? "Włącz powiadomienia" : "Enable notifications",
    notificationsDisabled: lang === "pl" ? "Powiadomienia o przekierowaniu są wyłączone." : "Redirect notifications are off.",
    cancelled: lang === "pl" ? "Przekierowanie wstrzymane." : "Redirect paused.",
    announce: (seconds: number) => (lang === "pl" ? `Przekierowanie nastąpi za ${seconds} s.` : `Redirecting in ${seconds} seconds.`),
    messageLabel: lang === "pl" ? "Komunikat:" : "Message:",
  };

  useEffect(() => {
    try {
      setNotificationsEnabled(localStorage.getItem(REDIRECT_NOTIFICATIONS_STORAGE_KEY) !== "false");
    } catch {
      setNotificationsEnabled(true);
    }
  }, []);

  useEffect(() => {
    const syncPreference = () => {
      try {
        setNotificationsEnabled(localStorage.getItem(REDIRECT_NOTIFICATIONS_STORAGE_KEY) !== "false");
      } catch {
        setNotificationsEnabled(true);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === REDIRECT_NOTIFICATIONS_STORAGE_KEY) {
        syncPreference();
      }
    };

    const handleCustomChange = () => syncPreference();

    window.addEventListener("storage", handleStorage);
    window.addEventListener(REDIRECT_NOTIFICATIONS_CHANGE_EVENT, handleCustomChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(REDIRECT_NOTIFICATIONS_CHANGE_EVENT, handleCustomChange);
    };
  }, []);

  useEffect(() => {
    if (!shouldShowPage) {
      try {
        window.location.replace(targetUrl);
      } catch {}
      return;
    }

    if (cancelled) return;
    if (countdown <= 0) {
      try {
        window.location.replace(targetUrl);
      } catch {}
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, cancelled, targetUrl, notificationsEnabled, shouldShowPage]);

  useEffect(() => {
    if (announcerRef.current) {
      if (!notificationsEnabled) {
        announcerRef.current.textContent = copy.notificationsDisabled;
        return;
      }

      announcerRef.current.textContent = countdown > 0 ? copy.announce(countdown) : copy.description;
    }
  }, [countdown, copy.description, copy.notificationsDisabled, notificationsEnabled]);

  const updateNotificationsEnabled = (nextEnabled: boolean) => {
    setNotificationsEnabled(nextEnabled);

    try {
      localStorage.setItem(REDIRECT_NOTIFICATIONS_STORAGE_KEY, String(nextEnabled));
    } catch {}

    window.dispatchEvent(new Event(REDIRECT_NOTIFICATIONS_CHANGE_EVENT));
  };

  if (!notificationsEnabled) {
    return null;
  }

  return (
    <div role="region" aria-label={copy.title} className="w-full">
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-surface p-6 shadow-sm dark:border-slate-700">
        <h1 className="text-3xl font-extrabold text-primary sm:text-4xl">URL Shorter</h1>
        <p className="text-base text-muted">{cancelled ? copy.cancelled : notificationsEnabled ? copy.description : copy.notificationsDisabled}</p>

        {shouldShowPage && message ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm font-semibold text-muted">{copy.messageLabel}</p>
            <p className="mt-1 text-base text-foreground">{message}</p>
          </div>
        ) : null}

        {notificationsEnabled ? (
          <p className="break-all text-sm text-muted">
            {copy.fallback} {" "}
            <a className="text-primary underline" href={targetUrl}>
              {targetUrl}
            </a>
            .
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                try {
                  window.location.replace(targetUrl);
                } catch {}
              }}
              className="min-h-11 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {copy.proceed}
            </button>
            <button
              type="button"
              onClick={() => setCancelled(true)}
              className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {copy.stay}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateNotificationsEnabled(!notificationsEnabled)}
              role="switch"
              aria-checked={notificationsEnabled}
              aria-label={copy.disableNotifications}
              className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${notificationsEnabled ? "border-emerald-500 bg-emerald-500" : "border-red-500 bg-red-500"}`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${notificationsEnabled ? "translate-x-7" : "translate-x-1"}`}
              />
            </button>
            <span className="text-sm font-semibold text-muted">
              {notificationsEnabled ? copy.disableNotifications : copy.enableNotifications}
            </span>
          </div>
        </div>
        <div className="sr-only" role="status" aria-live="polite" ref={announcerRef}></div>
      </div>
    </div>
  );
}