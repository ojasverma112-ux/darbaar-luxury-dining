import { useEffect, useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Cookie } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "dd.cookie-consent";

const CookieBanner = () => {
  const { lang } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!localStorage.getItem(STORAGE_KEY)) setShow(true);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const decide = (value: "accept" | "decline") => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, ts: Date.now() }));
    setShow(false);
  };

  const copy = lang === "nl"
    ? {
        title: "Wij gebruiken cookies",
        body: "Wij gebruiken essentiële cookies om de website te laten werken en optionele cookies om uw ervaring te verbeteren. Lees onze voorwaarden voor meer informatie.",
        accept: "Accepteren",
        decline: "Alleen essentieel",
        terms: "Voorwaarden",
      }
    : {
        title: "We use cookies",
        body: "We use essential cookies to run the site and optional cookies to improve your experience. See our terms for more details.",
        accept: "Accept all",
        decline: "Essential only",
        terms: "Terms",
      };

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:bottom-6 sm:max-w-md z-[90] transition-all duration-500",
        show ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
      )}
      role="dialog"
      aria-live="polite"
    >
      <div className="rounded-2xl glass-strong shadow-card p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-gold/10 p-2 mt-0.5">
            <Cookie className="h-4 w-4 text-gold" />
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-lg text-ivory">{copy.title}</h3>
            <p className="mt-1 text-xs text-ivory/70 leading-relaxed">
              {copy.body}{" "}
              <a href="/terms" className="text-gold hover:underline">{copy.terms}</a>
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => decide("decline")}
                className="flex-1 rounded-full gold-border px-4 py-2 text-xs font-medium text-ivory hover:bg-gold/10 transition-all"
              >
                {copy.decline}
              </button>
              <button
                onClick={() => decide("accept")}
                className="flex-1 rounded-full bg-gradient-gold px-4 py-2 text-xs font-semibold text-ink shadow-gold hover:scale-[1.02] transition-transform"
              >
                {copy.accept}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
