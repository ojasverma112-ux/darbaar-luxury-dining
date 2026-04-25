import { useEffect, useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { supabase } from "@/integrations/supabase/client";

interface Announcement {
  id: string;
  message: string;
  link_url: string | null;
  bg_color: string | null;
  text_color: string | null;
  display_order: number;
}

const PromoBar = () => {
  const { t } = useI18n();
  const [items, setItems] = useState<Announcement[] | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const nowIso = new Date().toISOString();
      const { data } = await supabase
        .from("announcements")
        .select("id,message,link_url,bg_color,text_color,display_order")
        .eq("active", true)
        .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
        .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
        .order("display_order", { ascending: true });
      if (mounted) setItems((data as Announcement[]) ?? []);
    };
    load();
    const channel = supabase
      .channel("announcements_public")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () => load())
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Rotate through multiple announcements
  useEffect(() => {
    if (!items || items.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(id);
  }, [items]);

  // Loading: show fallback so layout doesn't jump
  if (items === null) {
    return (
      <div className="relative z-[60] bg-gradient-gold text-ink overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-2 text-center text-[12px] sm:text-xs font-semibold tracking-wide">
          {t("promo.banner")}
        </div>
      </div>
    );
  }

  // No announcements configured → hide entirely
  if (items.length === 0) return null;

  const current = items[index];
  const style = {
    background: current.bg_color || undefined,
    color: current.text_color || undefined,
  };
  const content = (
    <div className="mx-auto max-w-7xl px-4 py-2 text-center text-[12px] sm:text-xs font-semibold tracking-wide">
      {current.message}
    </div>
  );

  return (
    <div
      className={`relative z-[60] overflow-hidden ${current.bg_color ? "" : "bg-gradient-gold text-ink"}`}
      style={style}
    >
      {current.link_url ? (
        <a href={current.link_url} target={current.link_url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="block">
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
};

export default PromoBar;
