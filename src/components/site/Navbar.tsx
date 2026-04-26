import { useEffect, useState } from "react";
import { Globe, Menu as MenuIcon, ShieldCheck, ShoppingBag, User, X } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-delhi-darbaar.png";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const sectionLinks: { id: string; key: "nav.menu" | "nav.signatures" | "nav.story" | "nav.reviews" | "nav.reserve" | "nav.contact" }[] = [
  { id: "signatures", key: "nav.signatures" },
  { id: "menu",       key: "nav.menu" },
  { id: "story",      key: "nav.story" },
  { id: "reviews",    key: "nav.reviews" },
  { id: "reserve",    key: "nav.reserve" },
  { id: "contact",    key: "nav.contact" },
];

const Navbar = () => {
  const { t, lang, setLang } = useI18n();
  const { count, openCart } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const logout = async () => {
    await signOut();
    setMobileOpen(false);
    toast({ title: "Signed out", description: "You can now sign in with another account." });
  };

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled ? "py-2" : "py-4"
      )}>
        <div className={cn(
          "mx-auto max-w-7xl px-4 sm:px-6 transition-all duration-500",
          scrolled ? "rounded-b-2xl glass-strong" : ""
        )}>
          <div className="flex items-center justify-between gap-4 py-2">
            <button
              onClick={() => scrollTo("top")}
              className="flex items-center gap-3 group"
              aria-label="Delhi Darbaar"
            >
              <img
                src={logo}
                alt="Delhi Darbaar logo"
                className={cn(
                  "transition-all duration-500 drop-shadow-[0_4px_24px_hsl(var(--gold)/0.35)]",
                  scrolled ? "h-10 sm:h-12" : "h-12 sm:h-14"
                )}
              />
              <span className="hidden md:flex flex-col leading-tight">
                <span className="font-serif text-lg text-gold tracking-wide">Delhi Darbaar</span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Hilversum</span>
              </span>
            </button>

            <nav className="hidden lg:flex items-center gap-7">
              {sectionLinks.map((l) => (
                <button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  className="text-sm font-medium text-ivory/80 hover:text-gold transition-colors relative group"
                >
                  {t(l.key)}
                  <span className="absolute left-0 -bottom-1 h-px w-0 bg-gradient-gold transition-all duration-300 group-hover:w-full" />
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setLang(lang === "nl" ? "en" : "nl")}
                className="flex items-center gap-1.5 rounded-full gold-border px-3 py-1.5 text-xs font-medium text-ivory hover:bg-gold/10 hover:border-gold/50 transition-all"
                aria-label="Toggle language"
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="uppercase tracking-wider">{lang === "nl" ? "EN" : "NL"}</span>
              </button>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full gold-border px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold/10"
                  aria-label="Admin"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Admin
                </Link>
              )}

              <Link
                to={user ? "/profile" : "/auth"}
                className="rounded-full p-2.5 gold-border hover:bg-gold/10 transition-all"
                aria-label={user ? "My account" : "Sign in"}
                title={user?.email ?? "Sign in"}
              >
                <User className="h-4 w-4 text-ivory" />
              </Link>

              {user && (
                <button
                  onClick={logout}
                  className="hidden sm:inline-flex rounded-full gold-border px-3 py-1.5 text-xs font-medium text-ivory hover:bg-gold/10"
                >
                  Sign out
                </button>
              )}

              <button
                onClick={openCart}
                className="relative rounded-full p-2.5 gold-border hover:bg-gold/10 hover:border-gold/50 transition-all"
                aria-label="Open cart"
              >
                <ShoppingBag className="h-4 w-4 text-ivory" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-gold text-[10px] font-bold text-ink px-1">
                    {count}
                  </span>
                )}
              </button>

              <button
                onClick={() => scrollTo("reserve")}
                className="hidden md:inline-flex rounded-full bg-gradient-gold px-5 py-2 text-sm font-semibold text-ink shadow-gold hover:scale-[1.03] transition-transform"
              >
                {t("nav.reserve")}
              </button>

              <button
                onClick={() => setMobileOpen((s) => !s)}
                className="lg:hidden rounded-full p-2.5 gold-border"
                aria-label="Open menu"
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-opacity duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-ink/85 backdrop-blur-xl" onClick={() => setMobileOpen(false)} />
        <div className="relative mt-24 mx-4 rounded-2xl glass-strong p-6 animate-fade-up">
          <nav className="flex flex-col gap-1">
            {sectionLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="text-left font-serif text-2xl text-ivory hover:text-gold transition-colors py-2"
              >
                {t(l.key)}
              </button>
            ))}
            <div className="hairline my-4" />
            {user && (
              <button
                onClick={logout}
                className="text-left font-serif text-2xl text-ivory hover:text-gold transition-colors py-2"
              >
                Sign out
              </button>
            )}
            <button
              onClick={() => scrollTo("menu")}
              className="rounded-full bg-gradient-gold px-5 py-3 text-sm font-semibold text-ink"
            >
              {t("nav.order")}
            </button>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;
