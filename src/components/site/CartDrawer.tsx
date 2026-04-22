import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useI18n } from "@/contexts/I18nContext";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type Method = "pickup" | "deliver";
type Step = "cart" | "checkout";

const CartDrawer = () => {
  const { lines, isOpen, closeCart, setQty, remove, subtotal, clear } = useCart();
  const { t, lang } = useI18n();
  const [method, setMethod] = useState<Method>("deliver");
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(false);
  const [step, setStep] = useState<Step>("cart");
  const [placing, setPlacing] = useState(false);

  const discount = applied ? subtotal * 0.1 : 0;
  const deliveryFee = method === "deliver" && subtotal > 0 && subtotal < 30 ? 3.5 : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);
  const minOk = method !== "deliver" || subtotal >= 20;

  const apply = () => {
    if (coupon.trim().toUpperCase() === "DARBAAR") {
      setApplied(true);
      toast({ title: t("cart.couponApplied") });
    } else {
      toast({ title: "Invalid code", variant: "destructive" });
    }
  };

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    setTimeout(() => {
      setPlacing(false);
      toast({ title: t("cart.placed") });
      clear();
      setStep("cart");
      closeCart();
    }, 900);
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[70] bg-ink/70 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={closeCart}
      />
      <aside
        className={cn(
          "fixed top-0 right-0 z-[80] h-full w-full sm:w-[440px] bg-ink-soft border-l border-gold/20 shadow-card transition-transform duration-500",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between p-5 border-b border-gold/15">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-gold" />
              <h2 className="font-serif text-2xl text-ivory">
                {step === "cart" ? t("cart.title") : t("cart.checkoutTitle")}
              </h2>
            </div>
            <button onClick={closeCart} className="rounded-full p-2 hover:bg-gold/10 transition-colors" aria-label="Close">
              <X className="h-4 w-4 text-ivory" />
            </button>
          </header>

          {step === "cart" ? (
            <>
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {!lines.length ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground py-20">
                    <ShoppingBag className="h-10 w-10 text-gold/40 mb-4" />
                    {t("cart.empty")}
                  </div>
                ) : (
                  lines.map((l) => (
                    <div key={l.item.id} className="flex gap-3 rounded-xl gold-border bg-card/60 p-3">
                      {l.item.image && (
                        <img src={l.item.image} alt={l.item.name[lang]} className="h-16 w-16 rounded-lg object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-serif text-base text-ivory truncate">{l.item.name[lang]}</div>
                          <button onClick={() => remove(l.item.id)} className="text-muted-foreground hover:text-accent transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="mt-1 text-xs text-gold">€{(l.item.price * l.qty).toFixed(2)}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <button onClick={() => setQty(l.item.id, l.qty - 1)} className="rounded-full gold-border p-1 hover:bg-gold/10">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm text-ivory">{l.qty}</span>
                          <button onClick={() => setQty(l.item.id, l.qty + 1)} className="rounded-full gold-border p-1 hover:bg-gold/10">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {lines.length > 0 && (
                <div className="border-t border-gold/15 p-5 space-y-4">
                  <div className="flex gap-2 rounded-full gold-border p-1">
                    {(["deliver", "pickup"] as Method[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMethod(m)}
                        className={cn(
                          "flex-1 rounded-full py-2 text-xs font-medium uppercase tracking-wider transition-all",
                          method === m ? "bg-gradient-gold text-ink" : "text-ivory/70 hover:text-ivory"
                        )}
                      >
                        {m === "deliver" ? t("cart.deliver") : t("cart.pickup")}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder={t("cart.coupon")}
                      className="flex-1 rounded-full gold-border bg-ink px-4 py-2 text-xs text-ivory placeholder:text-muted-foreground focus:outline-none focus:border-gold/60"
                    />
                    <button onClick={apply} className="rounded-full gold-border px-4 py-2 text-xs font-medium text-ivory hover:bg-gold/10 transition-all">
                      {t("cart.apply")}
                    </button>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-ivory/80">
                      <span>{t("cart.subtotal")}</span><span>€{subtotal.toFixed(2)}</span>
                    </div>
                    {applied && (
                      <div className="flex justify-between text-emerald-400">
                        <span>{t("cart.discount")} (DARBAAR)</span><span>−€{discount.toFixed(2)}</span>
                      </div>
                    )}
                    {method === "deliver" && (
                      <div className="flex justify-between text-ivory/80">
                        <span>{t("cart.delivery")}</span>
                        <span>{deliveryFee === 0 ? t("cart.free") : `€${deliveryFee.toFixed(2)}`}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-serif text-xl text-gold pt-2 border-t border-gold/15 mt-2">
                      <span>{t("cart.total")}</span><span>€{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {!minOk && (
                    <div className="text-xs text-accent">{t("cart.minOrder")}</div>
                  )}

                  <button
                    disabled={!minOk}
                    onClick={() => setStep("checkout")}
                    className="w-full rounded-full bg-gradient-gold px-6 py-3.5 text-sm font-semibold text-ink shadow-gold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {t("cart.checkout")}
                  </button>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={placeOrder} className="flex-1 overflow-y-auto p-5 space-y-4">
              {(["book.name","book.email","book.phone"] as const).map((k) => (
                <label key={k} className="block">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">{t(k)}</span>
                  <input required className="mt-1.5 w-full rounded-xl gold-border bg-ink px-4 py-2.5 text-sm text-ivory focus:outline-none focus:border-gold/60" />
                </label>
              ))}
              {method === "deliver" && (
                <>
                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">{t("cart.address")}</span>
                    <input required className="mt-1.5 w-full rounded-xl gold-border bg-ink px-4 py-2.5 text-sm text-ivory focus:outline-none focus:border-gold/60" />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">{t("cart.postal")}</span>
                      <input required className="mt-1.5 w-full rounded-xl gold-border bg-ink px-4 py-2.5 text-sm text-ivory focus:outline-none focus:border-gold/60" />
                    </label>
                    <label className="block">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">{t("cart.city")}</span>
                      <input required defaultValue="Hilversum" className="mt-1.5 w-full rounded-xl gold-border bg-ink px-4 py-2.5 text-sm text-ivory focus:outline-none focus:border-gold/60" />
                    </label>
                  </div>
                </>
              )}
              <div className="rounded-xl gold-border bg-card/40 p-3 text-xs text-muted-foreground">
                {t("cart.payNote")}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep("cart")} className="flex-1 rounded-full gold-border px-4 py-3 text-sm text-ivory hover:bg-gold/10 transition-all">
                  {t("cart.back")}
                </button>
                <button type="submit" disabled={placing} className="flex-1 rounded-full bg-gradient-gold px-4 py-3 text-sm font-semibold text-ink shadow-gold hover:scale-[1.02] transition-transform disabled:opacity-60">
                  {placing ? "…" : t("cart.placeOrder")} · €{total.toFixed(2)}
                </button>
              </div>
            </form>
          )}
        </div>
      </aside>
    </>
  );
};

export default CartDrawer;
