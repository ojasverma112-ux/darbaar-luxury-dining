import { useI18n } from "@/contexts/I18nContext";
import { Clock, MapPin, Phone, Mail, Navigation } from "lucide-react";
import SectionHeading from "./SectionHeading";

const Contact = () => {
  const { t } = useI18n();
  return (
    <section id="contact" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow={t("contact.eyebrow")} title={t("contact.title")} />

        <div className="mt-14 grid lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          <div className="rounded-3xl gold-border glass-strong p-8 sm:p-10 space-y-6 shadow-card lift">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-gold/10 p-3"><MapPin className="h-5 w-5 text-gold" /></div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{t("contact.address")}</div>
                <div className="mt-1 font-serif text-xl text-ivory">Havenstraat 75</div>
                <div className="text-ivory/80">1211KH Hilversum, Nederland</div>
              </div>
            </div>
            <div className="hairline" />
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-gold/10 p-3"><Clock className="h-5 w-5 text-gold" /></div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{t("contact.hours")}</div>
                <div className="mt-1 font-serif text-xl text-ivory">{t("contact.hoursVal")}</div>
                <div className="text-sm text-muted-foreground">{t("contact.closed")}</div>
              </div>
            </div>
            <div className="hairline" />
            <div className="grid sm:grid-cols-2 gap-4">
              <a
                href="tel:+31613533612"
                className="flex items-center gap-3 rounded-xl gold-border bg-ink-soft/60 px-4 py-3 hover:bg-gold/10 transition-all"
              >
                <Phone className="h-4 w-4 text-gold" />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("contact.call")}</div>
                  <div className="text-sm text-ivory">+31 613 53 36 12</div>
                </div>
              </a>
              <a
                href="mailto:info@delhidarbaar.nl"
                className="flex items-center gap-3 rounded-xl gold-border bg-ink-soft/60 px-4 py-3 hover:bg-gold/10 transition-all"
              >
                <Mail className="h-4 w-4 text-gold" />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("contact.email")}</div>
                  <div className="text-sm text-ivory">info@delhidarbaar.nl</div>
                </div>
              </a>
            </div>
            <a
              href="https://maps.google.com/?q=Havenstraat+75,+1211KH+Hilversum"
              target="_blank" rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold px-5 py-3 text-sm font-semibold text-ink shadow-gold hover:scale-[1.02] transition-transform"
            >
              <Navigation className="h-4 w-4" /> {t("contact.directions")}
            </a>
          </div>

          <div className="relative overflow-hidden rounded-3xl gold-border shadow-card min-h-[360px]">
            <iframe
              title="Delhi Darbaar Hilversum map"
              src="https://www.google.com/maps?q=Havenstraat+75,+1211KH+Hilversum&output=embed"
              className="absolute inset-0 w-full h-full grayscale-[0.3] contrast-[1.05]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-gold/15" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
