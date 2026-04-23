import { useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { I18nProvider } from "@/contexts/I18nContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, LogOut, Package, MapPin, ShoppingBag, Save, Edit2, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  id: string; name_nl: string; name_en: string; description_nl: string | null;
  description_en: string | null; price: number; category: string; active: boolean;
}
interface Zone {
  id: string; area: string; postcodes: string[]; min_order_value: number;
  delivery_fee: number; free_above: number | null; active: boolean;
}
interface Order {
  id: string; order_number: string; status: string; method: string;
  customer_first_name: string; customer_last_name: string; customer_email: string;
  customer_phone: string; postcode: string | null; total: number;
  created_at: string;
}

const Header = () => {
  const { user, signOut } = useAuth();
  return (
    <header className="border-b border-gold/15 bg-ink-soft">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl text-gold">Delhi Darbaar · Admin</Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{user?.email}</span>
          <button onClick={signOut} className="rounded-full gold-border px-3 py-1.5 text-xs text-ivory hover:bg-gold/10 flex items-center gap-1.5">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </div>
    </header>
  );
};

const ProductsTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Product>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("category").order("display_order");
    if (error) toast({ title: "Failed to load products", variant: "destructive" });
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (id: string) => {
    const { error } = await supabase.from("products").update({
      name_nl: draft.name_nl, name_en: draft.name_en,
      description_nl: draft.description_nl, description_en: draft.description_en,
      price: draft.price, active: draft.active,
    }).eq("id", id);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved" });
      setEditing(null);
      load();
    }
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-gold mx-auto mt-10" />;

  if (!products.length) {
    return (
      <div className="rounded-xl gold-border p-8 text-center">
        <p className="text-ivory/80 mb-3">No products yet in the database.</p>
        <p className="text-xs text-muted-foreground">Tip: use the seed button on the dashboard tab to import the menu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {products.map((p) => {
        const isEditing = editing === p.id;
        return (
          <div key={p.id} className="rounded-xl gold-border bg-card/40 p-4">
            {isEditing ? (
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Name NL</span>
                  <input value={draft.name_nl ?? ""} onChange={(e) => setDraft({ ...draft, name_nl: e.target.value })}
                    className="mt-1 w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory" />
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Name EN</span>
                  <input value={draft.name_en ?? ""} onChange={(e) => setDraft({ ...draft, name_en: e.target.value })}
                    className="mt-1 w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Description NL</span>
                  <textarea value={draft.description_nl ?? ""} onChange={(e) => setDraft({ ...draft, description_nl: e.target.value })}
                    rows={2} className="mt-1 w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Description EN</span>
                  <textarea value={draft.description_en ?? ""} onChange={(e) => setDraft({ ...draft, description_en: e.target.value })}
                    rows={2} className="mt-1 w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory" />
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Price (€)</span>
                  <input type="number" step="0.5" value={draft.price ?? 0} onChange={(e) => setDraft({ ...draft, price: parseFloat(e.target.value) })}
                    className="mt-1 w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory" />
                </label>
                <label className="flex items-center gap-2 text-sm text-ivory mt-6">
                  <input type="checkbox" checked={draft.active ?? true} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
                  Active (visible on menu)
                </label>
                <div className="sm:col-span-2 flex gap-2 mt-2">
                  <button onClick={() => save(p.id)} className="rounded-full bg-gradient-gold px-4 py-2 text-xs font-semibold text-ink flex items-center gap-1.5">
                    <Save className="h-3.5 w-3.5" /> Save
                  </button>
                  <button onClick={() => setEditing(null)} className="rounded-full gold-border px-4 py-2 text-xs text-ivory flex items-center gap-1.5">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-base text-ivory truncate">{p.name_nl}</span>
                    {!p.active && <span className="text-[10px] uppercase tracking-widest text-accent">hidden</span>}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{p.category} · {p.name_en}</div>
                </div>
                <div className="text-gold font-medium">€{Number(p.price).toFixed(2)}</div>
                <button
                  onClick={() => { setEditing(p.id); setDraft(p); }}
                  className="rounded-full gold-border p-2 text-ivory hover:bg-gold/10"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ZonesTab = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Zone>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("delivery_zones").select("*").order("area");
    setZones((data as Zone[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (id: string) => {
    const { error } = await supabase.from("delivery_zones").update({
      area: draft.area, postcodes: draft.postcodes,
      min_order_value: draft.min_order_value, delivery_fee: draft.delivery_fee,
      free_above: draft.free_above, active: draft.active,
    }).eq("id", id);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Zone updated" });
      setEditing(null);
      load();
    }
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-gold mx-auto mt-10" />;

  return (
    <div className="space-y-2">
      {zones.map((z) => {
        const isEditing = editing === z.id;
        return (
          <div key={z.id} className="rounded-xl gold-border bg-card/40 p-4">
            {isEditing ? (
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block sm:col-span-2">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Area</span>
                  <input value={draft.area ?? ""} onChange={(e) => setDraft({ ...draft, area: e.target.value })}
                    className="mt-1 w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Postcodes (comma separated)</span>
                  <input
                    value={(draft.postcodes ?? []).join(", ")}
                    onChange={(e) => setDraft({ ...draft, postcodes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                    className="mt-1 w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory" />
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Min order (€)</span>
                  <input type="number" step="0.5" value={draft.min_order_value ?? 0}
                    onChange={(e) => setDraft({ ...draft, min_order_value: parseFloat(e.target.value) })}
                    className="mt-1 w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory" />
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Delivery fee (€)</span>
                  <input type="number" step="0.05" value={draft.delivery_fee ?? 0}
                    onChange={(e) => setDraft({ ...draft, delivery_fee: parseFloat(e.target.value) })}
                    className="mt-1 w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory" />
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Free above (€, optional)</span>
                  <input type="number" step="0.5" value={draft.free_above ?? ""}
                    onChange={(e) => setDraft({ ...draft, free_above: e.target.value ? parseFloat(e.target.value) : null })}
                    className="mt-1 w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory" />
                </label>
                <label className="flex items-center gap-2 text-sm text-ivory mt-6">
                  <input type="checkbox" checked={draft.active ?? true} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
                  Active
                </label>
                <div className="sm:col-span-2 flex gap-2">
                  <button onClick={() => save(z.id)} className="rounded-full bg-gradient-gold px-4 py-2 text-xs font-semibold text-ink flex items-center gap-1.5">
                    <Save className="h-3.5 w-3.5" /> Save
                  </button>
                  <button onClick={() => setEditing(null)} className="rounded-full gold-border px-4 py-2 text-xs text-ivory flex items-center gap-1.5">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-base text-ivory">{z.area}</div>
                  <div className="text-xs text-muted-foreground truncate">{z.postcodes.join(", ")}</div>
                </div>
                <div className="text-right text-xs text-ivory/80">
                  <div>min €{Number(z.min_order_value).toFixed(2)}</div>
                  <div className="text-gold">€{Number(z.delivery_fee).toFixed(2)}{z.free_above ? ` · free €${Number(z.free_above).toFixed(0)}+` : ""}</div>
                </div>
                <button onClick={() => { setEditing(z.id); setDraft(z); }} className="rounded-full gold-border p-2 text-ivory hover:bg-gold/10">
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const OrdersTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast({ title: "Update failed", variant: "destructive" });
    else { toast({ title: "Order updated" }); load(); }
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-gold mx-auto mt-10" />;

  if (!orders.length) {
    return <div className="rounded-xl gold-border p-8 text-center text-muted-foreground">No orders yet.</div>;
  }

  return (
    <div className="space-y-2">
      {orders.map((o) => (
        <div key={o.id} className="rounded-xl gold-border bg-card/40 p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-gold">{o.order_number}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{o.method}</span>
              </div>
              <div className="text-sm text-ivory mt-1">{o.customer_first_name} {o.customer_last_name}</div>
              <div className="text-xs text-muted-foreground">{o.customer_email} · {o.customer_phone} {o.postcode ? `· ${o.postcode}` : ""}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{new Date(o.created_at).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-gold font-medium text-lg">€{Number(o.total).toFixed(2)}</div>
              <select
                value={o.status}
                onChange={(e) => updateStatus(o.id, e.target.value)}
                className="mt-1 rounded-full gold-border bg-ink px-3 py-1 text-xs text-ivory"
              >
                {["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SeedTab = () => {
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    supabase.from("products").select("*", { count: "exact", head: true }).then(({ count: c }) => setCount(c ?? 0));
  }, []);

  const seed = async () => {
    setBusy(true);
    try {
      const { menu } = await import("@/data/menu");
      const rows = menu.map((m, idx) => ({
        id: m.id,
        name_nl: m.name.nl, name_en: m.name.en,
        description_nl: m.desc.nl, description_en: m.desc.en,
        price: m.price, category: m.category,
        spice: m.spice ?? 0, tags: m.tags ?? [],
        display_order: idx,
        active: true,
      }));
      const { error } = await supabase.from("products").upsert(rows, { onConflict: "id" });
      if (error) throw error;
      toast({ title: `Seeded ${rows.length} products` });
      const { count: c } = await supabase.from("products").select("*", { count: "exact", head: true });
      setCount(c ?? 0);
    } catch (e: unknown) {
      toast({ title: "Seed failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl gold-border p-6 space-y-3">
      <h3 className="font-serif text-xl text-ivory">Seed menu into database</h3>
      <p className="text-sm text-muted-foreground">
        Currently {count} products in the database. This imports/updates all menu items from <code className="text-gold">src/data/menu.ts</code>.
      </p>
      <button
        onClick={seed} disabled={busy}
        className="rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-ink flex items-center gap-2 disabled:opacity-50"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Import / update all products
      </button>
    </div>
  );
};

const Dashboard = () => {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-ink-soft border border-gold/15">
          <TabsTrigger value="orders" className="data-[state=active]:bg-gradient-gold data-[state=active]:text-ink">
            <ShoppingBag className="h-3.5 w-3.5 mr-1.5" /> Orders
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-gradient-gold data-[state=active]:text-ink">
            <Package className="h-3.5 w-3.5 mr-1.5" /> Products
          </TabsTrigger>
          <TabsTrigger value="zones" className="data-[state=active]:bg-gradient-gold data-[state=active]:text-ink">
            <MapPin className="h-3.5 w-3.5 mr-1.5" /> Zones
          </TabsTrigger>
          <TabsTrigger value="seed" className="data-[state=active]:bg-gradient-gold data-[state=active]:text-ink">
            Seed
          </TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="mt-6"><OrdersTab /></TabsContent>
        <TabsContent value="products" className="mt-6"><ProductsTab /></TabsContent>
        <TabsContent value="zones" className="mt-6"><ZonesTab /></TabsContent>
        <TabsContent value="seed" className="mt-6"><SeedTab /></TabsContent>
      </Tabs>
    </main>
  );
};

const Admin = () => (
  <I18nProvider>
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          <Dashboard />
        </div>
      </ProtectedRoute>
    </AuthProvider>
  </I18nProvider>
);

export default Admin;
