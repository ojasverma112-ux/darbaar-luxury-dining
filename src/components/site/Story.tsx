import { useI18n } from "@/contexts/I18nContext";
import interior from "@/assets/story-restaurant.png";

const Story = () => {
  const { t } = useI18n();
  return (
    <section id="story" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="relative">
          <div className="absolute -inset-6 rounded-3xl bg-gradient-radial-glow blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl gold-border shadow-card lift">
            <img
              src={interior}
              alt="Delhi Darbaar warm restaurant interior with brass lanterns"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 hidden sm:block float-med">
            <div className="rounded-2xl glass-strong p-5 shadow-float">
              <div className="font-serif text-4xl text-gradient-gold">28+</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{t("story.years")}</div>
            </div>
          </div>
        </div>

        <div>
          <p className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-gold">
            {t("story.eyebrow")}
          </p>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl text-ivory leading-[1.05]">
            {t("story.title")}
          </h2>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t("story.body")}
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { v: "28+", l: t("story.years") },
              { v: "100+", l: t("story.recipes") },
              { v: "★", l: t("story.daily") },
            ].map((s, i) => (
              <div key={i} className="rounded-xl gold-border bg-card/60 p-4 text-center lift">
                <div className="font-serif text-3xl text-gradient-gold">{s.v}</div>
                <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 hairline" />
          <div className="mt-6 text-sm text-muted-foreground">
            <span className="text-gold">Havenstraat 75 · 1211KH Hilversum</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Story;
