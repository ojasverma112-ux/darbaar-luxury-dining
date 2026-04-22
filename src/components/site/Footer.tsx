import { useI18n } from "@/contexts/I18nContext";
import logo from "@/assets/logo-delhi-darbaar.png";

const Footer = () => {
  const { t } = useI18n();
  return (
    <footer className="relative border-t border-gold/10 bg-ink py-16">
      <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-3 gap-10">
        <div>
          <img src={logo} alt="Delhi Darbaar" className="h-16 mb-4" />
          <p className="text-sm text-muted-foreground max-w-xs">{t("footer.tag")}</p>
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
