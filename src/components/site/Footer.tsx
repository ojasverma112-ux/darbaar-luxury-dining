import { useI18n } from "@/contexts/I18nContext";
import logo from "@/assets/logo-delhi-darbaar.png";
import { Instagram, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const { t, lang } = useI18n();
  return (
    <footer className="relative border-t border-gold/10 bg-ink py-16">
      <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <img src={logo} alt="Delhi Darbaar" className="h-16 mb-4" />
          <p className="text-sm text-muted-foreground max-w-xs">{t("footer.tag")}</p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://www.instagram.com/delhidarbaar.nl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="rounded-full gold-border p-2.5 text-ivory hover:bg-gold/10 hover:text-gold transition-all"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://www.facebook.com/delhidarbaar.nl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="rounded-full gold-border p-2.5 text-ivory hover:bg-gold/10 hover:text-gold transition-all"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-gold mb-3">Delhi Darbaar Hilversum</div>
          <div className="text-sm text-ivory/80 leading-relaxed">
            Havenstraat 75<br />
            1211KH Hilversum<br />
            Nederland
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-gold mb-3">{t("contact.hours")}</div>
          <div className="text-sm text-ivory/80">{t("contact.hoursVal")}</div>
          <div className="text-sm text-muted-foreground">{t("contact.closed")}</div>
          <div className="mt-4 text-sm">
            <a href="tel:+31613533612" className="text-ivory hover:text-gold transition-colors">+31 613 53 36 12</a>
          </div>
          <div className="text-sm">
            <a href="mailto:info@delhidarbaar.nl" className="text-ivory hover:text-gold transition-colors">info@delhidarbaar.nl</a>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-gold mb-3">{lang === "nl" ? "Informatie" : "Information"}</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/terms" className="text-ivory/80 hover:text-gold transition-colors">{lang === "nl" ? "Algemene voorwaarden" : "Terms & Conditions"}</Link></li>
            <li><a href="#menu" className="text-ivory/80 hover:text-gold transition-colors">{t("nav.menu")}</a></li>
            <li><a href="#reserve" className="text-ivory/80 hover:text-gold transition-colors">{t("nav.reserve")}</a></li>
            <li><a href="#contact" className="text-ivory/80 hover:text-gold transition-colors">{t("nav.contact")}</a></li>
          </ul>
        </div>
      </div>
      <div className="hairline mt-12 max-w-7xl mx-auto" />
      <div className="mx-auto max-w-7xl px-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Delhi Darbaar. {t("footer.rights")}</span>
        <span className="text-gold/70">{t("footer.made")}</span>
      </div>
    </footer>
  );
};

export default Footer;
