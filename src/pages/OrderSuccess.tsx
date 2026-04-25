import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { I18nProvider } from "@/contexts/I18nContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider, useCart } from "@/contexts/CartContext";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { Check } from "lucide-react";

const Body = () => {
  const [params] = useSearchParams();
  const orderNumber = params.get("order");
  const { clear } = useCart();
  const [cleared, setCleared] = useState(false);

  // Clear the cart once on success page mount
  useEffect(() => {
    if (!cleared) {
      clear();
      setCleared(true);
    }
  }, [cleared, clear]);

  return (
    <main className="mx-auto max-w-2xl px-6 pt-32 pb-24 text-center">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-gold shadow-gold mb-6">
        <Check className="h-10 w-10 text-ink" />
      </div>
      <h1 className="font-serif text-5xl text-ivory">Thank you!</h1>
      <p className="mt-4 text-base text-ivory/80">
        Your payment was successful and your food is being prepared.
      </p>
      {orderNumber && (
        <p className="mt-3 text-sm text-muted-foreground">
          Order reference: <span className="font-mono text-gold">{orderNumber}</span>
        </p>
      )}
      <div className="mt-10 flex justify-center gap-3 flex-wrap">
        <Link to="/" className="rounded-full gold-border px-6 py-3 text-sm text-ivory hover:bg-gold/10 transition-all">
          Back to menu
        </Link>
        <Link to="/profile" className="rounded-full bg-gradient-gold px-6 py-3 text-sm font-semibold text-ink shadow-gold hover:scale-[1.02] transition-transform">
          View my orders
        </Link>
      </div>
    </main>
  );
};

const OrderSuccess = () => (
  <I18nProvider>
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <Body />
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  </I18nProvider>
);

export default OrderSuccess;
