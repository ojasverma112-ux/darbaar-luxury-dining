import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  menu as staticMenu,
  signatures as staticSignatures,
  categories,
  type MenuItem,
  type CategoryId,
  type SpiceLevel,
  type DietTag,
} from "@/data/menu";

// Map of product id → bundled image (so DB rows still get the nice photos
// without needing image_url uploads). Built from the static menu.
const staticImageById: Record<string, string | undefined> = Object.fromEntries(
  staticMenu.map((m) => [m.id, m.image])
);

interface DbProduct {
  id: string;
  name_nl: string;
  name_en: string;
  description_nl: string | null;
  description_en: string | null;
  price: number;
  category: string;
  image_url: string | null;
  spice: number | null;
  tags: string[] | null;
  active: boolean;
  display_order: number;
}

const toMenuItem = (p: DbProduct): MenuItem => ({
  id: p.id,
  name: { nl: p.name_nl, en: p.name_en },
  desc: { nl: p.description_nl ?? "", en: p.description_en ?? "" },
  price: Number(p.price),
  category: p.category as CategoryId,
  image: p.image_url ?? staticImageById[p.id],
  spice: ((p.spice ?? 0) as SpiceLevel),
  tags: (p.tags ?? []) as DietTag[],
});

export interface UseMenuResult {
  menu: MenuItem[];
  signatures: { id: string; image: string }[];
  loading: boolean;
  source: "db" | "static";
}

export const useMenu = (): UseMenuResult => {
  // Start with static data so the page renders immediately while DB loads.
  const [menu, setMenu] = useState<MenuItem[]>(staticMenu);
  const [source, setSource] = useState<"db" | "static">("static");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true });
      if (cancelled) return;
      if (!error && data && data.length > 0) {
        setMenu((data as DbProduct[]).map(toMenuItem));
        setSource("db");
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Signatures keep the curated order from staticSignatures, but pull live
  // price/name from the (possibly DB-updated) menu.
  const signatures = staticSignatures
    .map((s) => {
      const item = menu.find((m) => m.id === s.id);
      return item ? { id: s.id, image: item.image ?? s.image } : null;
    })
    .filter(Boolean) as { id: string; image: string }[];

  return { menu, signatures, loading, source };
};

export { categories };
export type { MenuItem, CategoryId };
