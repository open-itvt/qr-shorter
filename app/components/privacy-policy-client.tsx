"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/app/components/site-header";

type LanguageCode = "pl" | "en";

type Section = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type PolicyCopy = {
  heading: string;
  effectiveDate: string;
  intro: string;
  sections: Section[];
  contactTitle: string;
  contactBody: string;
  contactName: string;
  contactEmail: string;
  backHome: string;
};

const copy: Record<LanguageCode, PolicyCopy> = {
  en: {
    heading: "Privacy Policy",
    effectiveDate: "Effective date: May 4, 2026",
    intro:
      "This Privacy Policy explains how QR Shorter collects, uses, stores, and protects information when you use our URL shortener service. Our main operating region is Poland, but the service is available to users in the United States and the European Union.",
    sections: [
      {
        title: "Information we collect",
        paragraphs: [
          "We may collect the full link you submit, the shortened URL we generate, your user agent, IP-related data, and your history of shortened links.",
          "We also store some preferences and history in your browser's local storage so the site can remember your recent activity and settings on this device.",
        ],
      },
      {
        title: "How we use information",
        paragraphs: [
          "We use the data we collect to create short URLs, display link history, maintain analytics, prevent abuse, and operate the service reliably.",
          "Local storage is used to save your browser-side data, such as link history and site preferences, so you can return to them later on the same device.",
        ],
      },
      {
        title: "Cookies and similar technologies",
        paragraphs: [
          "We use cookies and similar technologies where needed to remember your preferred language and to support analytics. Some data may also be stored in local storage rather than cookies.",
          "Google Analytics may set cookies or use similar identifiers to measure traffic and usage patterns, subject to applicable law and your consent choices where required.",
        ],
      },
      {
        title: "Third-party services",
        paragraphs: ["We use Google Analytics to understand how the service is used and to improve the experience."],
      },
      {
        title: "Data security",
        paragraphs: [
          "We use reasonable technical and organizational measures to protect the information we process. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
        ],
      },
      {
        title: "Data retention",
        paragraphs: [
          "Browser-stored history remains on your device until you clear your browser data or remove it from the site settings. Server-side data is retained only as long as needed to operate the service, provide statistics, and meet legal or operational requirements.",
        ],
      },
      {
        title: "Your rights",
        paragraphs: [
          "Depending on where you live, you may have rights under GDPR, CCPA, and similar privacy laws. These may include the right to access, correct, delete, port, or restrict your personal data, and to object to certain processing.",
        ],
        bullets: [
          "GDPR: access, rectification, erasure, restriction, portability, and objection.",
          "CCPA: right to know, delete, correct, and opt out of the sale or sharing of personal information.",
          "You may also withdraw consent where processing relies on consent.",
        ],
      },
      {
        title: "International transfers",
        paragraphs: [
          "Because the service can be used from the United States and the European Union, data may be processed outside your country of residence. When required, we rely on appropriate safeguards and lawful transfer mechanisms.",
        ],
      },
    ],
    contactTitle: "Contact us about privacy",
    contactBody:
      "If you have privacy questions or want to exercise your rights, contact the site operator using the contact details published on the website. Please include enough information for us to understand your request.",
    contactName: "QR Shorter iTVT",
    contactEmail: "gdpr@itvt.xyz",
    backHome: "Back to home",
  },
  pl: {
    heading: "Polityka prywatności",
    effectiveDate: "Data obowiązywania: 4 maja 2026",
    intro:
      "Niniejsza Polityka prywatności wyjaśnia, w jaki sposób QR Shorter zbiera, wykorzystuje, przechowuje i chroni informacje podczas korzystania z usługi skracania linków. Główny region działania to Polska, ale usługa jest dostępna także dla użytkowników ze Stanów Zjednoczonych i Unii Europejskiej.",
    sections: [
      {
        title: "Jakie dane zbieramy",
        paragraphs: [
          "Możemy zbierać pełny link, który przesyłasz, utworzony przez nas skrócony adres URL, Twój user agent, dane związane z adresem IP oraz historię skróconych linków.",
          "Część ustawień i historii zapisujemy też w local storage przeglądarki, aby serwis mógł zapamiętać ostatnią aktywność i preferencje na tym urządzeniu.",
        ],
      },
      {
        title: "Jak wykorzystujemy dane",
        paragraphs: [
          "Dane wykorzystujemy do tworzenia krótkich adresów URL, wyświetlania historii linków, prowadzenia analityki, zapobiegania nadużyciom oraz niezawodnej obsługi serwisu.",
          "Local storage służy do zapisywania danych po stronie przeglądarki, takich jak historia linków i preferencje serwisu, aby można było wrócić do nich na tym samym urządzeniu.",
        ],
      },
      {
        title: "Pliki cookie i podobne technologie",
        paragraphs: [
          "Używamy plików cookie i podobnych technologii tam, gdzie jest to potrzebne do zapamiętania wybranego języka i obsługi analityki. Część danych może być zapisywana w local storage zamiast w plikach cookie.",
          "Google Analytics może wykorzystywać pliki cookie lub podobne identyfikatory do pomiaru ruchu i sposobu korzystania z serwisu, zgodnie z obowiązującym prawem oraz Twoimi wyborami dotyczącymi zgody, jeśli są wymagane.",
        ],
      },
      {
        title: "Usługi stron trzecich",
        paragraphs: ["Korzystamy z Google Analytics, aby rozumieć, w jaki sposób użytkownicy korzystają z serwisu i jak go ulepszać."],
      },
      {
        title: "Bezpieczeństwo danych",
        paragraphs: [
          "Stosujemy rozsądne środki techniczne i organizacyjne, aby chronić przetwarzane informacje. Żaden sposób transmisji ani przechowywania nie daje pełnej gwarancji bezpieczeństwa, dlatego nie możemy obiecać całkowitej ochrony.",
        ],
      },
      {
        title: "Okres przechowywania",
        paragraphs: [
          "Historia zapisana w przeglądarce pozostaje na Twoim urządzeniu do momentu wyczyszczenia danych przeglądarki lub usunięcia jej w ustawieniach serwisu. Dane po stronie serwera przechowujemy tylko tak długo, jak jest to potrzebne do działania usługi, statystyk oraz wymogów prawnych lub operacyjnych.",
        ],
      },
      {
        title: "Twoje prawa",
        paragraphs: [
          "W zależności od miejsca zamieszkania możesz mieć prawa wynikające z RODO, CCPA oraz innych przepisów o prywatności. Mogą one obejmować prawo dostępu, sprostowania, usunięcia, przenoszenia danych, ograniczenia przetwarzania oraz sprzeciwu wobec niektórych operacji.",
        ],
        bullets: [
          "RODO: dostęp, sprostowanie, usunięcie, ograniczenie, przenoszenie i sprzeciw.",
          "CCPA: prawo do informacji, usunięcia, sprostowania oraz rezygnacji ze sprzedaży lub udostępniania danych osobowych.",
          "Możesz też wycofać zgodę, jeśli przetwarzanie opiera się na zgodzie.",
        ],
      },
      {
        title: "Przekazywanie danych za granicę",
        paragraphs: [
          "Ponieważ z serwisu mogą korzystać użytkownicy z USA i UE, dane mogą być przetwarzane poza krajem Twojego zamieszkania. Gdy jest to wymagane, stosujemy odpowiednie zabezpieczenia i legalne mechanizmy przekazywania danych.",
        ],
      },
    ],
    contactTitle: "Kontakt w sprawach prywatności",
    contactBody:
      "Jeśli masz pytania dotyczące prywatności lub chcesz skorzystać ze swoich praw, skontaktuj się z operatorem serwisu za pomocą danych kontaktowych opublikowanych na stronie. Dołącz wystarczająco dużo informacji, abyśmy mogli zrozumieć Twoją prośbę.",
    contactName: "QR Shorter iTVT",
    contactEmail: "gdpr@itvt.xyz",
    backHome: "Wróć na stronę główną",
  },
};

function getInitialLanguage(): LanguageCode {
  if (typeof window === "undefined") {
    return "pl";
  }

  try {
    const stored = localStorage.getItem("site-language");
    if (stored === "pl" || stored === "en") {
      return stored;
    }
  } catch {
    // Ignore storage errors and fall back to browser language.
  }

  return navigator.language?.startsWith("pl") ? "pl" : "en";
}

export default function PrivacyPolicyClient() {
  const [lang, setLang] = useState<LanguageCode>(() => getInitialLanguage());

  useEffect(() => {
    try {
      document.documentElement.lang = lang;
    } catch {
      // Ignore DOM access failures during hydration.
    }
  }, [lang]);

  useEffect(() => {
    const syncLanguage = () => {
      setLang(getInitialLanguage());
    };

    syncLanguage();
    window.addEventListener("storage", syncLanguage);
    return () => window.removeEventListener("storage", syncLanguage);
  }, []);

  const content = useMemo(() => copy[lang], [lang]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader showHistoryLink={true} />

      <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-4 sm:px-6 sm:pb-24 sm:pt-8">
        <div className="rounded-[2rem] border border-slate-200 bg-surface px-5 py-8 shadow-sm dark:border-slate-700 sm:px-8 sm:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">{content.effectiveDate}</p>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">{content.heading}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted sm:text-lg sm:leading-8">{content.intro}</p>

          <div className="mt-10 space-y-8">
            {content.sections.map((section) => (
              <section key={section.title} className="space-y-4">
                <h2 className="text-xl font-bold sm:text-2xl">{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-foreground/90 sm:text-base sm:leading-8">
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-foreground/90 sm:text-base sm:leading-8">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <section className="space-y-4 rounded-2xl border border-slate-200 bg-background/60 p-5 dark:border-slate-700">
              <h2 className="text-xl font-bold sm:text-2xl">{content.contactTitle}</h2>
              <p className="text-sm leading-7 text-foreground/90 sm:text-base sm:leading-8">{content.contactBody}</p>
              <div className="rounded-xl border border-slate-200 bg-surface p-4 dark:border-slate-700">
                <p className="text-base font-semibold text-foreground">{content.contactName}</p>
                <a href={`mailto:${content.contactEmail}`} className="mt-1 inline-flex text-sm font-semibold text-primary transition hover:underline">
                  {content.contactEmail}
                </a>
              </div>
              <Link href="/" className="inline-flex text-sm font-semibold text-primary transition hover:underline">
                {content.backHome}
              </Link>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
