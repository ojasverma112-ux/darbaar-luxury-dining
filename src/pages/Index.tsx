import Navbar from "@/components/site/Navbar";
import PromoBar from "@/components/site/PromoBar";
import Hero from "@/components/site/Hero";
import TrustBar from "@/components/site/TrustBar";
import Signatures from "@/components/site/Signatures";
import Story from "@/components/site/Story";
import Menu from "@/components/site/Menu";
import Reviews from "@/components/site/Reviews";
import Reservation from "@/components/site/Reservation";
import Contact from "@/components/site/Contact";
import Footer from "@/components/site/Footer";
import CartDrawer from "@/components/site/CartDrawer";
import StickyOrderBar from "@/components/site/StickyOrderBar";
import { I18nProvider } from "@/contexts/I18nContext";
import { CartProvider } from "@/contexts/CartContext";

const Index = () => {
  return (
    <I18nProvider>
      <CartProvider>
        <div className="min-h-screen bg-background text-foreground">
          <PromoBar />
          <Navbar />
          <main>
            <Hero />
            <TrustBar />
            <Signatures />
            <Story />
            <Menu />
            <Reviews />
            <Reservation />
            <Contact />
          </main>
          <Footer />
          <CartDrawer />
          <StickyOrderBar />
        </div>
      </CartProvider>
    </I18nProvider>
  );
};

export default Index;
