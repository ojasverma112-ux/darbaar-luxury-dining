import { useI18n } from "@/contexts/I18nContext";
import { menu, signatures } from "@/data/menu";
import { useCart } from "@/contexts/CartContext";
import { Plus } from "lucide-react";
import SectionHeading from "./SectionHeading";

const Signatures = () => {
  const { t, lang } = useI18n();
  const { add } = useCart();
  const items = signatures
    .map((s) => {
      const item = menu.find((m) => m.id === s.id);
      return item ? { ...item, image: s.image } : null;
    })
    .filter(Boolean) as (typeof menu[number])[];

  return (
    <section id="signatures" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow={t("sig.eyebrow")}
          title={t("sig.title")}
          sub={t("sig.sub")}
        />

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {items.map((it, idx) => (
            <article
              key={it.id}
              className={`group relative overflow-hidden rounded-2xl gold-border bg-card lift ${idx % 3 === 0 ? "float-slow" : idx % 3 === 1 ? "float-med" : "float-fast"}`}
              style={{ animationDelay: `${idx * 0.4}s` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={it.image}
                  alt={it.name[lang]}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                <div className="absolute top-3 right-3 rounded-full glass px-2.5 py-1 text-[11px] font-medium text-gold">
                  €{it.price.toFixed(2)}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-serif text-2xl text-ivory leading-tight">{it.name[lang]}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{it.desc[lang]}</p>
                <button
                  onClick={() => add(it)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold px-4 py-2.5 text-sm font-semibold text-ink hover:scale-[1.02] transition-transform"
                >
                  <Plus className="h-4 w-4" /> {t("sig.add")}
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
            className="rounded-full gold-border px-6 py-3 text-sm font-medium text-ivory hover:bg-gold/10 hover:border-gold/60 transition-all"
          >
            {t("sig.viewMenu")} →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Signatures;
