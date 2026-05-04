"use client";

import React, { useEffect, useState } from "react";
import CopyableLinkRow from "@/app/components/copyable-link-row";

type Props = {
  enLabel: string;
  plLabel: string;
  enCopyLabel?: string;
  plCopyLabel?: string;
  enCopyText: string;
  plCopyText: string;
  enCopiedText: string;
  plCopiedText: string;
  enCopySuccessMessage: string;
  plCopySuccessMessage: string;
  enCopyErrorMessage: string;
  plCopyErrorMessage: string;
  value: string;
  href?: string;
};

export default function LocalizedCopyableLinkRow({
  enLabel,
  plLabel,
  enCopyLabel,
  plCopyLabel,
  enCopyText,
  plCopyText,
  enCopiedText,
  plCopiedText,
  enCopySuccessMessage,
  plCopySuccessMessage,
  enCopyErrorMessage,
  plCopyErrorMessage,
  value,
  href,
}: Props) {
  const [lang, setLang] = useState<"en" | "pl">("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("site-language");
      if (stored === "pl" || stored === "en") {
        setLang(stored as "en" | "pl");
        return;
      }
    } catch {}
    setLang("en");
  }, []);

  const label = lang === "pl" ? plLabel : enLabel;
  const copyLabel = lang === "pl" ? (plCopyLabel ?? plLabel) : (enCopyLabel ?? enLabel);
  const copyText = lang === "pl" ? plCopyText : enCopyText;
  const copiedText = lang === "pl" ? plCopiedText : enCopiedText;
  const copySuccessMessage = lang === "pl" ? plCopySuccessMessage : enCopySuccessMessage;
  const copyErrorMessage = lang === "pl" ? plCopyErrorMessage : enCopyErrorMessage;

  return (
    <CopyableLinkRow
      label={label}
      value={value}
      href={href}
      copyLabel={copyLabel}
      copyText={copyText}
      copiedText={copiedText}
      copySuccessMessage={copySuccessMessage}
      copyErrorMessage={copyErrorMessage}
    />
  );
}
