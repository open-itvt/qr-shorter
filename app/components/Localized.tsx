"use client";

import { useEffect, useState } from "react";

type LocalizedProps = {
  en: string;
  pl: string;
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
};

export default function Localized({ en, pl, tag = "span", className }: LocalizedProps) {
  const [lang, setLang] = useState<"en" | "pl">("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("site-language");
      if (stored === "pl" || stored === "en") {
        setLang(stored);
        return;
      }
    } catch {}
    setLang("en");
  }, []);

  const text = lang === "pl" ? pl : en;
  // @ts-ignore create element for given tag
  return React.createElement(tag, { className }, text);
}
