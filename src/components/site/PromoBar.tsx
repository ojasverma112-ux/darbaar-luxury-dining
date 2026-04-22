import { useI18n } from "@/contexts/I18nContext";

const PromoBar = () => {
  const { t } = useI18n();
  return (
    <div className="relative z-[60] bg-gradient-gold text-ink overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-2 text-center text-[12px] sm:text-xs font-semibold tracking-wide">
        {t("promo.banner")}
      </div>
    </div>
  );
};

export default PromoBar;
