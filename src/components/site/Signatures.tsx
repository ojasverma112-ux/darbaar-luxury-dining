import { useI18n } from "@/contexts/I18nContext";
import { useMenu, type MenuItem } from "@/hooks/useMenu";
import { useCart } from "@/contexts/CartContext";
import { Plus } from "lucide-react";
import SectionHeading from "./SectionHeading";

const Signatures = () => {
  const { t, lang } = useI18n();
  const { add } = useCart();
  const { menu, signatures } = useMenu();

  const items = signatures
    .map((s) => {
      const item = menu.find((m) => m.id === s.id);
      return item ? { ...item, image: s.image } : null;
    })
    .filter(Boolean) as MenuItem[];

  return (
    <section id="signatures" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow={t("sig.eyebrow")}
          title={t("sig.title")}
          sub={t("sig.sub")}
        />

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {items.map((it) => (
            <article
              key={it.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/80 backdrop-blur-sm shadow-[0_10px_35px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={it.image}
                  alt={it.name[lang]}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/15 to-transparent" />
                <div className="absolute top-3 right-3 rounded-full border border-gold/40 bg-ink/70 px-2.5 py-1 text-[11px] font-semibold text-gold">
                  €{it.price.toFixed(2)}
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-serif text-[1.55rem] leading-tight text-ivory">
                  {it.name[lang]}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {it.desc[lang]}
                </p>

                <button
                  onClick={() => add(it)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold px-4 py-2.5 text-sm font-semibold text-ink transition-all duration-200 hover:brightness-105 active:scale-[0.99]"
                >
                  <Plus className="h-4 w-4" />
                  {t("sig.add")}
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={() =>
              document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })
            }
            className="rounded-full border border-gold/40 px-6 py-3 text-sm font-medium text-ivory transition-all hover:border-gold/70 hover:bg-gold/10"
          >
            {t("sig.viewMenu")} →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Signatures;
