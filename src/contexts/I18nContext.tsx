import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Lang, type TranslationKey } from "@/data/translations";

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "nl";
    const stored = localStorage.getItem("dd.lang");
    return (stored === "en" || stored === "nl") ? stored : "nl";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("dd.lang", lang);
  }, [lang]);

  const value = useMemo<I18nCtx>(() => ({
    lang,
    setLang: setLangState,
    t: (key) => translations[lang][key] ?? translations.en[key] ?? String(key),
  }), [lang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
};
