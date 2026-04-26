import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { I18nProvider, useI18n } from "@/contexts/I18nContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { z } from "zod";

type Mode = "login" | "signup";

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
});

const Form = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const { lang } = useI18n();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  // Already logged in → intended page or home
  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [user, loading, navigate, from]);

  const t = (nl: string, en: string) => (lang === "nl" ? nl : en);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) return; // bot
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast({ title: t("Ongeldige invoer", "Invalid input"), description: parsed.error.issues[0]?.message, variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}${from}` },
        });
        if (error) throw error;
        toast({ title: t("Account aangemaakt", "Account created") });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: t("Welkom terug", "Welcome back") });
      }
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      toast({ title: t("Mislukt", "Failed"), description: msg, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${from}`,
      extraParams: { prompt: "select_account" },
    });
    if (result.error) {
      toast({ title: "Google sign-in failed", variant: "destructive" });
      setBusy(false);
      return;
    }

    if (!result.redirected) navigate(from, { replace: true });
  };

  return (
    <main className="mx-auto max-w-md px-6 pt-32 pb-24">
      <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold hover:text-gold-glow">
        <ArrowLeft className="h-3.5 w-3.5" /> {t("Terug", "Back")}
      </Link>
      <h1 className="mt-6 font-serif text-4xl text-ivory">
        {mode === "login" ? t("Inloggen", "Sign in") : t("Account aanmaken", "Sign up")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "login"
          ? t("Welkom terug bij Delhi Darbaar.", "Welcome back to Delhi Darbaar.")
          : t("Maak een account aan om sneller te bestellen.", "Create an account to check out faster.")}
      </p>

      <div className="mt-8 space-y-4">
        <button
          onClick={google}
          disabled={busy}
          className="w-full rounded-full gold-border bg-ink px-5 py-3 text-sm font-medium text-ivory hover:bg-gold/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#fff" d="M22.5 12.27c0-.79-.07-1.55-.2-2.27H12v4.51h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.3z"/><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23z" opacity=".85"/><path fill="#fff" d="M5.85 14.12a6.6 6.6 0 0 1 0-4.24V7.04H2.18a11 11 0 0 0 0 9.92l3.67-2.84z" opacity=".55"/><path fill="#fff" d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.67 2.84C6.71 7.31 9.14 5.38 12 5.38z" opacity=".7"/></svg>
          {t("Doorgaan met Google", "Continue with Google")}
        </button>

        <div className="relative text-center">
          <span className="hairline absolute inset-x-0 top-1/2" />
          <span className="relative bg-background px-3 text-xs uppercase tracking-widest text-muted-foreground">
            {t("of", "or")}
          </span>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {/* Honeypot — hidden from real users */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
            aria-hidden="true"
          />
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">{t("E-mail", "Email")}</span>
            <input
              type="email" required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl gold-border bg-ink px-4 py-2.5 text-sm text-ivory focus:outline-none focus:border-gold/60"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">{t("Wachtwoord", "Password")}</span>
            <input
              type="password" required minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl gold-border bg-ink px-4 py-2.5 text-sm text-ivory focus:outline-none focus:border-gold/60"
            />
          </label>
          <button
            type="submit" disabled={busy}
            className="w-full rounded-full bg-gradient-gold px-6 py-3 text-sm font-semibold text-ink shadow-gold hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? t("Inloggen", "Sign in") : t("Account aanmaken", "Sign up")}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full text-center text-xs text-muted-foreground hover:text-gold transition-colors"
        >
          {mode === "login"
            ? t("Nog geen account? Registreer hier.", "No account yet? Sign up here.")
            : t("Heb je al een account? Inloggen.", "Already have an account? Sign in.")}
        </button>
      </div>
    </main>
  );
};

const Auth = () => (
  <I18nProvider>
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <Form />
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  </I18nProvider>
);

export default Auth;
