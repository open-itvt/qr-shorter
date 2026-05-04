"use client";

import React, { useEffect, useState } from "react";
import CopyableLinkRow from "@/app/components/copyable-link-row";

type Props = {
  enLabel: string;
  plLabel: string;
  enCopyLabel?: string;
  plCopyLabel?: string;
  value: string;
  href?: string;
};

export default function LocalizedCopyableLinkRow({ enLabel, plLabel, enCopyLabel, plCopyLabel, value, href }: Props) {
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

  return <CopyableLinkRow label={label} value={value} href={href} copyLabel={copyLabel} />;
}
