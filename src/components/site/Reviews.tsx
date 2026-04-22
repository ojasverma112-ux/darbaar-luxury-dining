import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { reviews } from "@/data/reviews";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeading from "./SectionHeading";

const Reviews = () => {
  const { t, lang } = useI18n();
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const next = el.scrollLeft + el.clientWidth * 0.6;
      if (next >= el.scrollWidth - el.clientWidth - 4) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollTo({ left: next, behavior: "smooth" });
    }, 5500);
    return () => clearInterval(id);
  }, [paused]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  };

  return (
    <section id="reviews" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow={t("reviews.eyebrow")} title={t("reviews.title")} sub={t("reviews.sub")} />

        <div className="mt-14 relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div
            ref={trackRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
            {reviews.map((r, i) => (
              <article
                key={i}
                className="snap-start shrink-0 w-[88%] sm:w-[55%] lg:w-[32%] rounded-2xl gold-border bg-card/70 p-7 lift"
              >
                <Quote className="h-7 w-7 text-gold/60" />
                <div className="mt-3 flex items-center gap-0.5">
                  {Array.from({ length: r.rating }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-gold text-gold" style={{ animationDelay: `${k * 0.08}s` }} />
                  ))}
                </div>
                <p className="mt-4 font-serif text-xl text-ivory leading-snug">
                  "{lang === "nl" ? r.textNl : r.textEn}"
                </p>
                <div className="mt-6 hairline" />
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-ivory">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.date}</div>
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-gold/70">Google</div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => scrollBy(-1)}
              className="rounded-full p-2.5 gold-border hover:bg-gold/10 transition-all"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4 text-ivory" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              className="rounded-full p-2.5 gold-border hover:bg-gold/10 transition-all"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4 text-ivory" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
