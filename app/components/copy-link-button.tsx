"use client";

import { useState } from "react";

type CopyLinkButtonProps = {
  value: string;
  label: string;
  copyText: string;
  copiedText: string;
  copySuccessMessage: string;
  copyErrorMessage: string;
};

export default function CopyLinkButton({
  value,
  label,
  copyText,
  copiedText,
  copySuccessMessage,
  copyErrorMessage,
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const [announce, setAnnounce] = useState<string | null>(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setAnnounce(copySuccessMessage);
      window.setTimeout(() => setCopied(false), 1500);
      window.setTimeout(() => setAnnounce(null), 1500);
    } catch {
      setCopied(false);
      setAnnounce(copyErrorMessage);
      window.setTimeout(() => setAnnounce(null), 1500);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={copyToClipboard}
        aria-label={copied ? `${copiedText}: ${label}` : `${copyText}: ${label}`}
        title={copied ? `${copiedText}: ${label}` : `${copyText}: ${label}`}
        className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 text-sm font-semibold text-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-primary/20 dark:border-primary/45"
      >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
        <span>{copied ? copiedText : copyText}</span>
      </button>
      <div role="status" aria-live="polite" className="sr-only">
        {announce}
      </div>
    </div>
  );
}