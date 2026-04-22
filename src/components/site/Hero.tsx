import hero from "@/assets/hero-tandoori.jpg";
import { useI18n } from "@/contexts/I18nContext";
import Particles from "./Particles";
import { ChevronDown } from "lucide-react";

const Hero = () => {
  const { t } = useI18n();
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={hero}
          alt="Cinematic flame-grilled tandoori platter"
          width={1920}
          height={1080}
          className="h-full w-full object-cover ken-burns"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/55 to-ink" />
        <div className="absolute inset-0 bg-gradient-radial-glow" />
      </div>

      <Particles count={26} />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col items-center justify-center px-6 text-center pt-28 pb-20">
        <p className="mb-5 inline-flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-gold rise-fade">
          <span className="h-px w-8 bg-gold/60" />
          {t("hero.eyebrow")}
          <span className="h-px w-8 bg-gold/60" />
        </p>

        <h1 className="font-serif text-[clamp(2.5rem,7vw,6rem)] leading-[1.02] text-ivory max-w-4xl rise-fade" style={{ animationDelay: "0.1s" }}>
          {t("hero.title").split(" ").slice(0, -3).join(" ")}{" "}
          <span className="shimmer-gold underline-gold">
            {t("hero.title").split(" ").slice(-3).join(" ")}
          </span>
        </h1>

        <p className="mt-8 max-w-2xl text-base sm:text-lg text-ivory/75 rise-fade" style={{ animationDelay: "0.4s" }}>
          {t("hero.sub")}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 rise-fade" style={{ animationDelay: "0.6s" }}>
          <button
            onClick={() => scrollTo("menu")}
            className="rounded-full bg-gradient-gold px-7 sm:px-8 py-3.5 text-sm sm:text-base font-semibold text-ink shadow-gold hover:scale-[1.04] transition-transform glow-pulse"
          >
            {t("hero.cta.order")}
          </button>
          <button
            onClick={() => scrollTo("reserve")}
            className="rounded-full gold-border bg-ink/40 backdrop-blur px-7 sm:px-8 py-3.5 text-sm sm:text-base font-semibold text-ivory hover:bg-gold/10 hover:border-gold/60 transition-all"
          >
            {t("hero.cta.reserve")}
          </button>
        </div>

        <button
          onClick={() => scrollTo("signatures")}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-xs uppercase tracking-[0.3em] text-ivory/60 hover:text-gold transition-colors"
        >
          {t("hero.scroll")}
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </button>
      </div>
    </section>
  );
};

export default Hero;
