import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StoreSettings {
  id: string;
  is_delivery_open: boolean;
  is_pickup_open: boolean;
  temporary_message: string | null;
  standard_lead_time_minutes: number;
}

/** Fetches the single global store_settings row and keeps it live via realtime. */
export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("store_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (mounted) {
        setSettings((data as StoreSettings) ?? null);
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel("store_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "store_settings" },
        () => load()
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { settings, loading };
}
