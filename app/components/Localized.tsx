"use client";

import React, { useEffect, useState } from "react";

type LocalizedProps = {
  en: string;
  pl: string;
  tag?: keyof React.JSX.IntrinsicElements;
  className?: string;
};

export default function Localized({ en, pl, tag = "span", className }: LocalizedProps) {
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

  const text = lang === "pl" ? pl : en;
  return React.createElement(tag as any, { className }, text);
}
