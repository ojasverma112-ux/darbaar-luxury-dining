import { ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useI18n } from "@/contexts/I18nContext";

const StickyOrderBar = () => {
  const { count, subtotal, openCart } = useCart();
  const { t } = useI18n();
  if (count === 0) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] sm:hidden">
      <button
        onClick={openCart}
        className="w-full rounded-full bg-gradient-gold px-5 py-3.5 shadow-gold flex items-center justify-between font-semibold text-ink glow-pulse"
      >
        <span className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" />
          {count} · {t("cart.checkout")}
        </span>
        <span>€{subtotal.toFixed(2)}</span>
      </button>
    </div>
  );
};

export default StickyOrderBar;
