import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { AlertTriangle, Check, Loader2, Lock, MapPin, Minus, Plus, ShoppingBag, Trash2, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { quoteDelivery, normalizePostcode } from "@/data/delivery";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

type Method = "pickup" | "delivery";
type Step = "cart" | "checkout";

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
      {label} {required && <span className="text-accent">*</span>}
    </span>
    <div className="mt-1">{children}</div>
  </label>
);

const inputCls = "w-full rounded-xl gold-border bg-ink px-4 py-2.5 text-sm text-ivory focus:outline-none focus:border-gold/60";

const CartDrawer = () => {
  const { lines, isOpen, closeCart, setQty, remove, subtotal, clear } = useCart();
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { settings } = useStoreSettings();

  const [method, setMethod] = useState<Method>("delivery");
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(false);
  const [step, setStep] = useState<Step>("cart");
  const [placing, setPlacing] = useState(false);

  // Login toggle inside checkout
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Billing
  const [bill, setBill] = useState({
    first_name: "", last_name: "", company: "", country: "Netherlands",
    address: "", city: "", postcode: "", phone: "", email: "",
  });

  // Ship to different
  const [shipDifferent, setShipDifferent] = useState(false);
  const [ship, setShip] = useState({
    first_name: "", last_name: "", company: "", country: "Netherlands",
    address: "", city: "", postcode: "",
  });

  // Order details
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [notes, setNotes] = useState("");

  // Account creation
  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");

  // Honeypot — bots fill, humans never see
  const [hp, setHp] = useState("");

  // Prefill from authenticated user's profile
  useEffect(() => {
    if (!user) return;
    setLoginEmail(user.email ?? "");
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setBill((b) => ({
          ...b,
          first_name: data.first_name ?? b.first_name,
          last_name: data.last_name ?? b.last_name,
          company: data.company ?? b.company,
          phone: data.phone ?? b.phone,
          email: data.email ?? user.email ?? b.email,
          address: data.address ?? b.address,
          city: data.city ?? b.city,
          postcode: data.postcode ?? b.postcode,
        }));
      } else {
        setBill((b) => ({ ...b, email: user.email ?? b.email }));
      }
    });
  }, [user]);

  const discount = applied ? subtotal * 0.1 : 0;
  const subtotalAfter = Math.max(0, subtotal - discount);

  const checkoutPostcode = method === "delivery" ? bill.postcode : "";
  const quote = useMemo(() => quoteDelivery(checkoutPostcode, subtotalAfter), [checkoutPostcode, subtotalAfter]);

  // Live check: is the entered postcode in an ACTIVE zone (per database)?
  const [zoneStatus, setZoneStatus] = useState<"unknown" | "checking" | "active" | "paused" | "out">("unknown");
  useEffect(() => {
    if (method !== "delivery" || checkoutPostcode.length !== 4) {
      setZoneStatus("unknown");
      return;
    }
    let cancelled = false;
    setZoneStatus("checking");
    (async () => {
      const { data } = await supabase
        .from("delivery_zones")
        .select("active")
        .contains("postcodes", [checkoutPostcode]);
      if (cancelled) return;
      if (!data || data.length === 0) setZoneStatus("out");
      else if (data.some((z) => z.active)) setZoneStatus("active");
      else setZoneStatus("paused");
    })();
    return () => { cancelled = true; };
  }, [checkoutPostcode, method]);

  const deliveryClosed = !!settings && method === "delivery" && !settings.is_delivery_open;
  const pickupClosed = !!settings && method === "pickup" && !settings.is_pickup_open;
  const methodClosed = deliveryClosed || pickupClosed;
  const postcodePaused = method === "delivery" && zoneStatus === "paused";

  const deliveryFee = method === "delivery" && quote.zone ? quote.fee : 0;
  const canDeliver = method !== "delivery" || quote.ok;
  const canPlace = !methodClosed && !postcodePaused && canDeliver;
  const total = Math.max(0, subtotalAfter + deliveryFee);

  const apply = () => {
    if (coupon.trim().toUpperCase() === "DARBAAR") {
      setApplied(true);
      toast({ title: t("cart.couponApplied") });
    } else {
      toast({ title: lang === "nl" ? "Ongeldige code" : "Invalid code", variant: "destructive" });
    }
  };

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    setLoggingIn(false);
    if (error) toast({ title: lang === "nl" ? "Inloggen mislukt" : "Login failed", description: error.message, variant: "destructive" });
    else { toast({ title: lang === "nl" ? "Welkom terug" : "Welcome back" }); setShowLogin(false); }
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) return;
    if (createAccount && !user && accountPassword.length < 8) {
      toast({ title: lang === "nl" ? "Wachtwoord min. 8 tekens" : "Password min. 8 chars", variant: "destructive" });
      return;
    }
    setPlacing(true);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const { data, error } = await supabase.functions.invoke("place-order", {
        body: {
          items: lines.map((l) => ({ product_id: l.item.id, quantity: l.qty })),
          method,
          customer: {
            first_name: bill.first_name, last_name: bill.last_name,
            company: bill.company, phone: bill.phone, email: bill.email,
          },
          address: method === "delivery" ? {
            street: bill.address, city: bill.city,
            postcode: normalizePostcode(bill.postcode), country: bill.country,
          } : undefined,
          ship_to_different: shipDifferent,
          ship_address: shipDifferent ? {
            first_name: ship.first_name, last_name: ship.last_name,
            company: ship.company, street: ship.address,
            city: ship.city, postcode: normalizePostcode(ship.postcode),
          } : undefined,
          delivery_date: deliveryDate || undefined,
          delivery_time: deliveryTime || undefined,
          notes: notes || undefined,
          coupon_code: applied ? "DARBAAR" : undefined,
          create_account: !user && createAccount,
          account_password: !user && createAccount ? accountPassword : undefined,
          hp,
        },
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({
        title: lang === "nl" ? "Bestelling geplaatst!" : "Order placed!",
        description: `${data.order_number} · €${data.total.toFixed(2)}`,
      });
      clear();
      setStep("cart");
      closeCart();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      toast({ title: lang === "nl" ? "Bestelling mislukt" : "Order failed", description: msg, variant: "destructive" });
    } finally {
      setPlacing(false);
    }
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
          "fixed top-0 right-0 z-[80] h-full w-full sm:w-[480px] bg-ink-soft border-l border-gold/20 shadow-card transition-transform duration-500",
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

          {settings?.temporary_message && (
            <div className="border-b border-accent/30 bg-accent/10 px-5 py-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-accent leading-relaxed">{settings.temporary_message}</p>
            </div>
          )}

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
                    {(["delivery", "pickup"] as Method[]).map((mm) => {
                      const closed = !!settings && (mm === "delivery" ? !settings.is_delivery_open : !settings.is_pickup_open);
                      return (
                        <button
                          key={mm}
                          onClick={() => !closed && setMethod(mm)}
                          disabled={closed}
                          title={closed ? (lang === "nl" ? "Tijdelijk gesloten" : "Temporarily closed") : undefined}
                          className={cn(
                            "flex-1 rounded-full py-2 text-xs font-medium uppercase tracking-wider transition-all",
                            method === mm ? "bg-gradient-gold text-ink" : "text-ivory/70 hover:text-ivory",
                            closed && "opacity-40 cursor-not-allowed line-through"
                          )}
                        >
                          {mm === "delivery" ? t("cart.deliver") : t("cart.pickup")}
                        </button>
                      );
                    })}
                  </div>

                  {methodClosed && (
                    <div className="rounded-xl border border-accent/30 bg-accent/10 p-3 text-xs text-accent flex items-start gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>
                        {method === "delivery"
                          ? (lang === "nl"
                            ? "Bezorging is tijdelijk gepauzeerd. Probeer het later opnieuw of kies Afhalen."
                            : "Delivery is currently paused. Please try again later or choose Pickup.")
                          : (lang === "nl"
                            ? "Afhalen is tijdelijk gepauzeerd. Probeer het later opnieuw."
                            : "Pickup is currently paused. Please try again later.")}
                      </span>
                    </div>
                  )}

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
                    <div className="flex justify-between font-serif text-xl text-gold pt-2 border-t border-gold/15 mt-2">
                      <span>{t("cart.total")}</span><span>€{subtotalAfter.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep("checkout")}
                    className="w-full rounded-full bg-gradient-gold px-6 py-3.5 text-sm font-semibold text-ink shadow-gold hover:scale-[1.02] transition-transform"
                  >
                    {t("cart.checkout")}
                  </button>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={placeOrder} className="flex-1 overflow-y-auto">
              {/* Honeypot */}
              <input
                type="text" tabIndex={-1} autoComplete="off"
                value={hp} onChange={(e) => setHp(e.target.value)}
                style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                aria-hidden="true"
              />

              <div className="p-5 space-y-5">
                {/* Returning customer toggle */}
                {!user && (
                  <div className="rounded-xl gold-border bg-card/40 p-4">
                    <button
                      type="button"
                      onClick={() => setShowLogin((v) => !v)}
                      className="text-xs text-gold hover:text-gold-glow flex items-center gap-2"
                    >
                      <Lock className="h-3 w-3" />
                      {lang === "nl" ? "Terugkerende klant? Klik hier om in te loggen" : "Returning customer? Click here to login"}
                    </button>
                    {showLogin && (
                      <div className="mt-3 space-y-2 pt-3 border-t border-gold/15">
                        <p className="text-[11px] text-muted-foreground">
                          {lang === "nl"
                            ? "Heb je al eerder besteld? Vul hieronder je gegevens in. Anders ga door naar de gegevens."
                            : "Already ordered before? Sign in below. Otherwise continue to billing."}
                        </p>
                        <Field label={lang === "nl" ? "E-mail" : "Email"} required>
                          <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={inputCls} />
                        </Field>
                        <Field label={lang === "nl" ? "Wachtwoord" : "Password"} required>
                          <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={inputCls} />
                        </Field>
                        <button
                          type="button" onClick={doLogin} disabled={loggingIn}
                          className="rounded-full bg-gradient-gold px-4 py-2 text-xs font-semibold text-ink flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {loggingIn && <Loader2 className="h-3 w-3 animate-spin" />}
                          {lang === "nl" ? "Inloggen" : "Sign in"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {user && (
                  <div className="rounded-xl gold-border bg-card/40 p-3 text-xs text-ivory/80 flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-gold" />
                    {lang === "nl" ? "Ingelogd als" : "Signed in as"} <strong>{user.email}</strong>
                  </div>
                )}

                {/* Billing */}
                <div>
                  <h3 className="font-serif text-xl text-ivory mb-3">{lang === "nl" ? "Factuurgegevens" : "Billing details"}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label={lang === "nl" ? "Voornaam" : "First name"} required>
                      <input required value={bill.first_name} onChange={(e) => setBill({ ...bill, first_name: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label={lang === "nl" ? "Achternaam" : "Last name"} required>
                      <input required value={bill.last_name} onChange={(e) => setBill({ ...bill, last_name: e.target.value })} className={inputCls} />
                    </Field>
                    <div className="col-span-2">
                      <Field label={lang === "nl" ? "Bedrijfsnaam (optioneel)" : "Company name (optional)"}>
                        <input value={bill.company} onChange={(e) => setBill({ ...bill, company: e.target.value })} className={inputCls} />
                      </Field>
                    </div>
                    <div className="col-span-2">
                      <Field label={lang === "nl" ? "Land / Regio" : "Country / Region"} required>
                        <input value={bill.country} disabled className={cn(inputCls, "opacity-70")} />
                      </Field>
                    </div>
                    {method === "delivery" && (
                      <>
                        <div className="col-span-2">
                          <Field label={lang === "nl" ? "Straat & huisnummer" : "Street address"} required>
                            <input required value={bill.address} onChange={(e) => setBill({ ...bill, address: e.target.value })} className={inputCls} />
                          </Field>
                        </div>
                        <Field label={lang === "nl" ? "Stad" : "Town / City"} required>
                          <input required value={bill.city} onChange={(e) => setBill({ ...bill, city: e.target.value })} className={inputCls} />
                        </Field>
                        <Field label="Postcode" required>
                          <div className="flex items-center gap-2 rounded-xl gold-border bg-ink px-3 py-2 focus-within:border-gold/60">
                            <MapPin className="h-3.5 w-3.5 text-gold/70" />
                            <input
                              required inputMode="numeric" maxLength={4}
                              value={bill.postcode}
                              onChange={(e) => setBill({ ...bill, postcode: normalizePostcode(e.target.value) })}
                              className="flex-1 bg-transparent text-sm text-ivory focus:outline-none"
                            />
                          </div>
                        </Field>
                      </>
                    )}
                    <Field label={lang === "nl" ? "Telefoon" : "Phone"} required>
                      <input required type="tel" value={bill.phone} onChange={(e) => setBill({ ...bill, phone: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label={lang === "nl" ? "E-mail" : "Email address"} required>
                      <input required type="email" value={bill.email} onChange={(e) => setBill({ ...bill, email: e.target.value })} className={inputCls} />
                    </Field>
                  </div>

                  {/* Postcode result */}
                  {method === "delivery" && bill.postcode.length === 4 && (
                    <>
                      {zoneStatus === "paused" ? (
                        <div className="mt-3 rounded-xl p-3 text-xs bg-accent/10 border border-accent/30 text-accent flex items-start gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>
                            {lang === "nl"
                              ? "Bezorging naar deze postcode is tijdelijk gepauzeerd."
                              : "Delivery to this postal code is temporarily paused."}
                          </span>
                        </div>
                      ) : (
                        <div className={cn(
                          "mt-3 rounded-xl p-3 text-xs",
                          quote.zone ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                                      : "bg-accent/10 border border-accent/30 text-accent"
                        )}>
                          {quote.zone ? (
                            <div className="flex items-start gap-2">
                              <Check className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                              <div>
                                <div>{t("cart.postcodeOk")} <strong>{quote.zone.area}</strong></div>
                                <div className="mt-1 text-ivory/70">
                                  {t("cart.zoneFee")}: €{quote.zone.fee.toFixed(2)}
                                  {quote.zone.freeAbove && ` (${lang === "nl" ? "gratis vanaf" : "free from"} €${quote.zone.freeAbove})`}
                                  {" · "}{t("cart.zoneMin")}: €{quote.zone.minOrder.toFixed(2)}
                                </div>
                                {quote.reason === "below-minimum" && (
                                  <div className="mt-1 text-accent">{t("cart.minOrder")} €{quote.zone.minOrder.toFixed(2)}</div>
                                )}
                              </div>
                            </div>
                          ) : (
                            t("cart.postcodeOut")
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Create account */}
                  {!user && (
                    <div className="mt-4 rounded-xl gold-border bg-card/40 p-3 space-y-2">
                      <label className="flex items-center gap-2 text-sm text-ivory">
                        <input type="checkbox" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} />
                        {lang === "nl" ? "Account aanmaken?" : "Create an account?"}
                      </label>
                      {createAccount && (
                        <Field label={lang === "nl" ? "Wachtwoord (min. 8 tekens)" : "Password (min. 8 chars)"} required>
                          <input type="password" minLength={8} value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)} className={inputCls} />
                        </Field>
                      )}
                    </div>
                  )}

                  {/* Ship to different */}
                  {method === "delivery" && (
                    <label className="mt-4 flex items-center gap-2 text-sm text-ivory">
                      <input type="checkbox" checked={shipDifferent} onChange={(e) => setShipDifferent(e.target.checked)} />
                      {lang === "nl" ? "Bezorgen op een ander adres?" : "Ship to a different address?"}
                    </label>
                  )}
                </div>

                {shipDifferent && method === "delivery" && (
                  <div>
                    <h3 className="font-serif text-xl text-ivory mb-3">{lang === "nl" ? "Verzendadres" : "Shipping address"}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={lang === "nl" ? "Voornaam" : "First name"} required>
                        <input required value={ship.first_name} onChange={(e) => setShip({ ...ship, first_name: e.target.value })} className={inputCls} />
                      </Field>
                      <Field label={lang === "nl" ? "Achternaam" : "Last name"} required>
                        <input required value={ship.last_name} onChange={(e) => setShip({ ...ship, last_name: e.target.value })} className={inputCls} />
                      </Field>
                      <div className="col-span-2">
                        <Field label={lang === "nl" ? "Bedrijfsnaam (optioneel)" : "Company name (optional)"}>
                          <input value={ship.company} onChange={(e) => setShip({ ...ship, company: e.target.value })} className={inputCls} />
                        </Field>
                      </div>
                      <div className="col-span-2">
                        <Field label={lang === "nl" ? "Straat & huisnummer" : "Street address"} required>
                          <input required value={ship.address} onChange={(e) => setShip({ ...ship, address: e.target.value })} className={inputCls} />
                        </Field>
                      </div>
                      <Field label={lang === "nl" ? "Stad" : "Town / City"} required>
                        <input required value={ship.city} onChange={(e) => setShip({ ...ship, city: e.target.value })} className={inputCls} />
                      </Field>
                      <Field label="Postcode" required>
                        <input required maxLength={4} value={ship.postcode} onChange={(e) => setShip({ ...ship, postcode: normalizePostcode(e.target.value) })} className={inputCls} />
                      </Field>
                    </div>
                  </div>
                )}

                {/* Delivery date / time / notes */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label={lang === "nl" ? "Bezorgdatum" : "Delivery date"} required={method === "delivery"}>
                    <input type="date" required={method === "delivery"} value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className={inputCls} />
                  </Field>
                  <Field label={lang === "nl" ? "Tijd" : "Time"} required={method === "delivery"}>
                    <input type="time" required={method === "delivery"} value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} className={inputCls} />
                  </Field>
                </div>
                <Field label={lang === "nl" ? "Opmerkingen (optioneel)" : "Order notes (optional)"}>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} />
                </Field>

                {/* Totals */}
                <div className="rounded-xl gold-border bg-card/40 p-4 space-y-1.5 text-sm">
                  <div className="flex justify-between text-ivory/80"><span>{t("cart.subtotal")}</span><span>€{subtotal.toFixed(2)}</span></div>
                  {applied && <div className="flex justify-between text-emerald-400"><span>{t("cart.discount")}</span><span>−€{discount.toFixed(2)}</span></div>}
                  {method === "delivery" && quote.zone && (
                    <div className="flex justify-between text-ivory/80">
                      <span>{t("cart.delivery")} · {quote.zone.area}</span>
                      <span>{deliveryFee === 0 ? t("cart.free") : `€${deliveryFee.toFixed(2)}`}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-serif text-xl text-gold pt-2 border-t border-gold/15 mt-2">
                    <span>{t("cart.total")}</span><span>€{total.toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  {lang === "nl" ? "Door uw bestelling te plaatsen gaat u akkoord met onze " : "By placing your order you agree to our "}
                  <Link to="/terms" className="text-gold hover:underline">{lang === "nl" ? "voorwaarden" : "terms"}</Link>.
                </p>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep("cart")} className="flex-1 rounded-full gold-border px-4 py-3 text-sm text-ivory hover:bg-gold/10 transition-all">
                    {t("cart.back")}
                  </button>
                  <button
                    type="submit"
                    disabled={placing || !canPlace}
                    className="flex-1 rounded-full bg-gradient-gold px-4 py-3 text-sm font-semibold text-ink shadow-gold hover:scale-[1.02] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {placing && <Loader2 className="h-4 w-4 animate-spin" />}
                    {placing ? "…" : t("cart.placeOrder")} · €{total.toFixed(2)}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </aside>
    </>
  );
};

export default CartDrawer;
