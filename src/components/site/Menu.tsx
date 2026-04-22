import { useMemo, useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { categories, menu, type CategoryId, type MenuItem } from "@/data/menu";
import { useCart } from "@/contexts/CartContext";
import { Flame, Leaf, Plus, Search, Sparkles } from "lucide-react";
import SectionHeading from "./SectionHeading";

const SpiceDots = ({ level = 0 }: { level?: number }) => {
  if (!level) return null;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Spice ${level}/3`}>
      {[1, 2, 3].map((n) => (
        <Flame key={n} className={`h-3 w-3 ${n <= level ? "text-accent fill-accent" : "text-muted-foreground/30"}`} />
      ))}
    </span>
  );
};

const Tag = ({ children, tone = "gold" }: { children: React.ReactNode; tone?: "gold" | "green" | "spice" }) => {
  const cls =
    tone === "green" ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
    : tone === "spice" ? "border-accent/40 text-accent bg-accent/10"
    : "border-gold/30 text-gold bg-gold/5";
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${cls}`}>{children}</span>;
};

const MenuCard = ({ item }: { item: MenuItem }) => {
  const { lang, t } = useI18n();
  const { add } = useCart();
  return (
    <article className="group relative flex gap-4 rounded-2xl gold-border bg-card/70 p-4 sm:p-5 lift">
      {item.image && (
        <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl">
          <img src={item.image} alt={item.name[lang]} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-xl sm:text-2xl text-ivory leading-tight">{item.name[lang]}</h3>
          <span className="font-serif text-lg sm:text-xl text-gold whitespace-nowrap">€{item.price.toFixed(2)}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.desc[lang]}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <SpiceDots level={item.spice} />
          {item.tags?.includes("veg") && <Tag tone="green"><Leaf className="h-2.5 w-2.5" />{t("tag.veg")}</Tag>}
          {item.tags?.includes("vegan") && <Tag tone="green">{t("tag.vegan")}</Tag>}
          {item.tags?.includes("halal") && <Tag>{t("tag.halal")}</Tag>}
          {item.tags?.includes("chef") && <Tag tone="spice"><Sparkles className="h-2.5 w-2.5" />{t("tag.chef")}</Tag>}
        </div>
        <div className="mt-3 flex items-center justify-end">
          <button
            onClick={() => add(item)}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-gold px-4 py-1.5 text-xs font-semibold text-ink hover:scale-[1.04] transition-transform"
          >
            <Plus className="h-3.5 w-3.5" /> {t("menu.add")}
          </button>
        </div>
      </div>
    </article>
  );
};

const Menu = () => {
  const { t, lang } = useI18n();
  const [active, setActive] = useState<CategoryId | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menu.filter((m) => {
      if (active !== "all" && m.category !== active) return false;
      if (!q) return true;
      return (
        m.name.nl.toLowerCase().includes(q) ||
        m.name.en.toLowerCase().includes(q) ||
        m.desc.nl.toLowerCase().includes(q) ||
        m.desc.en.toLowerCase().includes(q)
      );
    });
  }, [active, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    for (const item of filtered) {
      (groups[item.category] ||= []).push(item);
    }
    return groups;
  }, [filtered]);

  return (
    <section id="menu" className="relative py-24 sm:py-32 bg-ink-soft/30">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow={t("menu.eyebrow")} title={t("menu.title")} sub={t("menu.sub")} />

        {/* Search */}
        <div className="mt-12 mx-auto max-w-xl relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("menu.search")}
            className="w-full rounded-full gold-border bg-card/70 pl-11 pr-4 py-3 text-sm text-ivory placeholder:text-muted-foreground focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20 transition-all"
          />
        </div>

        {/* Category pills */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setActive("all")}
            className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all ${
              active === "all"
                ? "bg-gradient-gold text-ink shadow-gold"
                : "gold-border text-ivory/80 hover:bg-gold/10"
            }`}
          >
            {t("menu.allCategories")}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all ${
                active === c.id
                  ? "bg-gradient-gold text-ink shadow-gold"
                  : "gold-border text-ivory/80 hover:bg-gold/10"
              }`}
            >
              {lang === "nl" ? c.nl : c.en}
            </button>
          ))}
        </div>

        {/* Grouped grid */}
        <div className="mt-14 space-y-16">
          {categories
            .filter((c) => grouped[c.id]?.length)
            .map((c) => (
              <div key={c.id}>
                <div className="mb-6 flex items-center gap-4">
                  <h3 className="font-serif text-3xl sm:text-4xl text-ivory">
                    {lang === "nl" ? c.nl : c.en}
                  </h3>
                  <div className="flex-1 hairline" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {grouped[c.id].map((item) => <MenuCard key={item.id} item={item} />)}
                </div>
              </div>
            ))}

          {!filtered.length && (
            <div className="text-center text-muted-foreground py-20">{t("menu.noResults")}</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Menu;
