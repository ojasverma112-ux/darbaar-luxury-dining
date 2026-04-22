import { Star, ChefHat, Truck, Leaf, Sparkles } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const TrustBar = () => {
  const { t } = useI18n();
  const items = [
    { icon: Star,     label: t("trust.rating"),   highlight: true },
    { icon: ChefHat,  label: t("trust.chefs") },
    { icon: Truck,    label: t("trust.delivery") },
    { icon: Sparkles, label: t("trust.fresh") },
    { icon: Leaf,     label: t("trust.veg") },
  ];
  return (
    <section className="relative -mt-px border-y border-gold/10 bg-ink-soft/60 backdrop-blur">
      <div className="mx-auto max-w-7xl overflow-hidden px-4 py-5">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-12">
          {items.map(({ icon: Icon, label, highlight }, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm text-ivory/80">
              <Icon className={`h-4 w-4 ${highlight ? "text-gold fill-gold" : "text-gold"}`} />
              <span className="whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
