import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import SectionHeading from "./SectionHeading";
import { Calendar, Check, Clock, Mail, Phone, User, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Reservation = () => {
  const { t } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast({ title: t("book.success") });
    }, 900);
  };

  const Field = ({ icon: Icon, label, ...props }: { icon: React.ElementType; label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="relative mt-2">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/70" />
        <input
          {...props}
          className="w-full rounded-xl gold-border bg-ink-soft/60 pl-11 pr-4 py-3 text-sm text-ivory placeholder:text-muted-foreground focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20 transition-all"
        />
      </div>
    </label>
  );

  return (
    <section id="reserve" className="relative py-24 sm:py-32 bg-ink-soft/30">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading eyebrow={t("book.eyebrow")} title={t("book.title")} sub={t("book.sub")} />

        <form
          onSubmit={onSubmit}
          className="mt-12 rounded-3xl gold-border glass-strong p-7 sm:p-10 shadow-card"
        >
          {submitted ? (
            <div className="flex flex-col items-center text-center py-8 animate-fade-up">
              <div className="rounded-full bg-gradient-gold p-4 shadow-gold mb-5">
                <Check className="h-7 w-7 text-ink" />
              </div>
              <h3 className="font-serif text-3xl text-ivory">{t("book.success")}</h3>
              <p className="mt-3 text-sm text-muted-foreground">+31 613 53 36 12 · info@delhidarbaar.nl</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field icon={User}     label={t("book.name")}   type="text"  required name="name" placeholder="" />
                <Field icon={Mail}     label={t("book.email")}  type="email" required name="email" />
                <Field icon={Phone}    label={t("book.phone")}  type="tel"   required name="phone" />
                <Field icon={Users}    label={t("book.guests")} type="number" min={1} max={20} defaultValue={2} required name="guests" />
                <Field icon={Calendar} label={t("book.date")}   type="date"  required name="date" />
                <Field icon={Clock}    label={t("book.time")}   type="time"  required name="time" defaultValue="19:00" />
              </div>
              <label className="mt-5 block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{t("book.notes")}</span>
                <textarea
                  rows={3}
                  name="notes"
                  className="mt-2 w-full rounded-xl gold-border bg-ink-soft/60 px-4 py-3 text-sm text-ivory placeholder:text-muted-foreground focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20 transition-all resize-none"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="mt-7 w-full rounded-full bg-gradient-gold px-6 py-4 text-sm font-semibold text-ink shadow-gold hover:scale-[1.02] transition-transform disabled:opacity-60"
              >
                {loading ? "…" : t("book.submit")}
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
};

export default Reservation;
