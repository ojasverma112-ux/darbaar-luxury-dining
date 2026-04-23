import { I18nProvider, useI18n } from "@/contexts/I18nContext";
import { CartProvider } from "@/contexts/CartContext";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Body = () => {
  const { lang } = useI18n();

  const sectionsNl = [
    { h: "1. Algemeen", p: "Deze voorwaarden zijn van toepassing op alle bestellingen, reserveringen en bezoeken bij Delhi Darbaar Hilversum, gevestigd aan Havenstraat 75, 1211 KH Hilversum, Nederland." },
    { h: "2. Bestellingen & bezorging", p: "Bezorging is alleen mogelijk binnen onze servicegebieden (zie postcodelijst in de winkelwagen). Minimale bestelbedragen en bezorgkosten gelden per postcodegebied. Verwachte levertijd is een indicatie en kan variëren tijdens drukke uren." },
    { h: "3. Prijzen & betaling", p: "Alle prijzen zijn inclusief BTW. Betaling kan contant of per pin bij ontvangst plaatsvinden, of online via een veilige betaalprovider zodra deze geactiveerd is." },
    { h: "4. Annuleren", p: "Bestellingen kunnen kosteloos geannuleerd worden tot de bereiding is gestart. Reserveringen graag minimaal 2 uur van tevoren annuleren via telefoon of e-mail." },
    { h: "5. Allergenen", p: "Wij werken met noten, zuivel, gluten, vis, schaaldieren en andere allergenen. Vermeld allergieën altijd vooraf zodat wij u veilig kunnen bedienen." },
    { h: "6. Privacy & cookies", p: "Wij gebruiken essentiële cookies voor de werking van de site en optionele cookies voor analytics. Persoonsgegevens worden alleen verwerkt voor het uitvoeren van uw bestelling of reservering en nooit verkocht aan derden." },
    { h: "7. Aansprakelijkheid", p: "Delhi Darbaar is niet aansprakelijk voor indirecte schade voortvloeiend uit gebruik van de website of consumptie van producten, behoudens opzet of grove nalatigheid." },
    { h: "8. Toepasselijk recht", p: "Op alle overeenkomsten is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in het arrondissement Midden-Nederland." },
    { h: "9. Contact", p: "Vragen? Bel +31 613 53 36 12 of mail info@delhidarbaar.nl." },
  ];

  const sectionsEn = [
    { h: "1. General", p: "These terms apply to all orders, reservations and visits at Delhi Darbaar Hilversum, located at Havenstraat 75, 1211 KH Hilversum, the Netherlands." },
    { h: "2. Orders & delivery", p: "Delivery is only available within our service areas (see postcode list in the cart). Minimum order amounts and delivery fees apply per postcode area. Estimated delivery times are indicative and may vary during peak hours." },
    { h: "3. Prices & payment", p: "All prices include VAT. Payment can be made cash or by card on arrival, or online through a secure payment provider once activated." },
    { h: "4. Cancellation", p: "Orders may be cancelled free of charge until preparation has started. Please cancel reservations at least 2 hours in advance by phone or email." },
    { h: "5. Allergens", p: "We work with nuts, dairy, gluten, fish, shellfish and other allergens. Always inform us of any allergies in advance so we can serve you safely." },
    { h: "6. Privacy & cookies", p: "We use essential cookies to run the site and optional cookies for analytics. Personal data is only processed to fulfil your order or reservation and is never sold to third parties." },
    { h: "7. Liability", p: "Delhi Darbaar is not liable for indirect damage resulting from use of the website or consumption of products, except in cases of intent or gross negligence." },
    { h: "8. Governing law", p: "All agreements are governed by Dutch law. Disputes will be submitted to the competent court of the Midden-Nederland district." },
    { h: "9. Contact", p: "Questions? Call +31 613 53 36 12 or email info@delhidarbaar.nl." },
  ];

  const sections = lang === "nl" ? sectionsNl : sectionsEn;

  return (
    <main className="mx-auto max-w-3xl px-6 pt-32 pb-24">
      <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold hover:text-gold-glow transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> {lang === "nl" ? "Terug naar home" : "Back to home"}
      </Link>
      <h1 className="mt-6 font-serif text-5xl text-ivory">
        {lang === "nl" ? "Algemene voorwaarden" : "Terms & Conditions"}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {lang === "nl" ? "Laatst bijgewerkt: 23 april 2026" : "Last updated: April 23, 2026"}
      </p>
      <div className="hairline mt-8" />
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-serif text-2xl text-gold">{s.h}</h2>
            <p className="mt-2 text-sm text-ivory/80 leading-relaxed">{s.p}</p>
          </section>
        ))}
      </div>
    </main>
  );
};

const Terms = () => (
  <I18nProvider>
    <CartProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <Body />
        <Footer />
      </div>
    </CartProvider>
  </I18nProvider>
);

export default Terms;
