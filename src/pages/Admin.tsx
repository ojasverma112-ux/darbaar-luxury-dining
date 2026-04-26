import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { I18nProvider } from "@/contexts/I18nContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, LogOut, Package, MapPin, ShoppingBag, Save, Edit2, X, Settings, Plus, Trash2, ShieldCheck, Megaphone, Eye, EyeOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface Product {
  id: string; name_nl: string; name_en: string; description_nl: string | null;
  description_en: string | null; price: number; category: string; active: boolean;
}
interface Zone {
  id: string; area: string; postcodes: string[]; min_order_value: number;
  delivery_fee: number; free_above: number | null; active: boolean;
}
type OrderStatus = "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";

interface Order {
  id: string; order_number: string; status: OrderStatus; method: string;
  customer_first_name: string; customer_last_name: string; customer_email: string;
  customer_phone: string; postcode: string | null; total: number;
  created_at: string;
}

interface StoreSettings {
  id: string;
  is_delivery_open: boolean;
  is_pickup_open: boolean;
  temporary_message: string | null;
  standard_lead_time_minutes: number;
}

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <header className="border-b border-gold/15 bg-ink-soft">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl text-gold">Delhi Darbaar · Admin</Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{user?.email}</span>
          <button onClick={logout} className="rounded-full gold-border px-3 py-1.5 text-xs text-ivory hover:bg-gold/10 flex items-center gap-1.5">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </div>
    </header>
  );
};

/* -------------------- Store Status (Panic Button) -------------------- */
const StoreStatusTab = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [leadTime, setLeadTime] = useState(45);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("store_settings").select("*").limit(1).maybeSingle();
    if (data) {
      setSettings(data as StoreSettings);
      setMessage(data.temporary_message ?? "");
      setLeadTime(data.standard_lead_time_minutes ?? 45);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateField = async (patch: Partial<StoreSettings>) => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase.from("store_settings").update(patch).eq("id", settings.id);
    setSaving(false);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Saved" }); load(); }
  };

  if (loading || !settings) return <Loader2 className="h-6 w-6 animate-spin text-gold mx-auto mt-10" />;

  return (
    <div className="space-y-4">
      <div className="rounded-xl gold-border bg-card/40 p-6">
        <h3 className="font-serif text-2xl text-ivory mb-1">Panic controls</h3>
        <p className="text-sm text-muted-foreground mb-6">Flip a switch to instantly stop accepting new online orders.</p>

        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4 rounded-xl bg-ink/50 p-4">
            <div>
              <div className="text-base font-medium text-ivory">Accepting deliveries now</div>
              <div className="text-xs text-muted-foreground">When off, the website blocks delivery checkout.</div>
            </div>
            <Switch
              checked={settings.is_delivery_open}
              onCheckedChange={(v) => updateField({ is_delivery_open: v })}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl bg-ink/50 p-4">
            <div>
              <div className="text-base font-medium text-ivory">Accepting pickups now</div>
              <div className="text-xs text-muted-foreground">When off, the website blocks pickup checkout.</div>
            </div>
            <Switch
              checked={settings.is_pickup_open}
              onCheckedChange={(v) => updateField({ is_pickup_open: v })}
              disabled={saving}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl gold-border bg-card/40 p-6 space-y-3">
        <h3 className="font-serif text-xl text-ivory">Customer notice banner</h3>
        <p className="text-xs text-muted-foreground">
          Shown at the top of the cart/checkout. Leave empty to hide. Example: "Kitchen is very busy, expect 90 min delays."
        </p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          placeholder="e.g. Kitchen is very busy, expect 90 min delays"
          className="w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory"
        />
        <div className="flex gap-2">
          <button
            onClick={() => updateField({ temporary_message: message.trim() || null })}
            disabled={saving}
            className="rounded-full bg-gradient-gold px-4 py-2 text-xs font-semibold text-ink flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" /> Save banner
          </button>
          {settings.temporary_message && (
            <button
              onClick={() => { setMessage(""); updateField({ temporary_message: null }); }}
              disabled={saving}
              className="rounded-full gold-border px-4 py-2 text-xs text-ivory hover:bg-gold/10 flex items-center gap-1.5"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl gold-border bg-card/40 p-6 space-y-3">
        <h3 className="font-serif text-xl text-ivory">Standard lead time (minutes)</h3>
        <p className="text-xs text-muted-foreground">Shown to customers as the typical preparation/delivery time.</p>
        <div className="flex gap-2 items-center">
          <input
            type="number" min={5} max={240}
            value={leadTime}
            onChange={(e) => setLeadTime(parseInt(e.target.value || "0"))}
            className="w-32 rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory"
          />
          <button
            onClick={() => updateField({ standard_lead_time_minutes: leadTime })}
            disabled={saving}
            className="rounded-full bg-gradient-gold px-4 py-2 text-xs font-semibold text-ink flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------- Products (unchanged) -------------------- */
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

/* -------------------- Zones (upgraded with create/delete + chips + per-zone toggle) -------------------- */
const PostcodeChips = ({
  postcodes,
  onChange,
}: { postcodes: string[]; onChange: (next: string[]) => void }) => {
  const [input, setInput] = useState("");

  const add = () => {
    const cleaned = input.trim().replace(/\s+/g, "").slice(0, 4);
    if (!/^\d{4}$/.test(cleaned)) {
      toast({ title: "Postcode must be 4 digits", variant: "destructive" });
      return;
    }
    if (postcodes.includes(cleaned)) {
      toast({ title: "Already added" });
      setInput("");
      return;
    }
    onChange([...postcodes, cleaned]);
    setInput("");
  };

  const remove = (pc: string) => onChange(postcodes.filter((p) => p !== pc));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {postcodes.length === 0 && <span className="text-xs text-muted-foreground">No postcodes yet.</span>}
        {postcodes.map((pc) => (
          <span key={pc} className="inline-flex items-center gap-1 rounded-full bg-gold/15 border border-gold/30 px-2.5 py-1 text-xs text-ivory">
            {pc}
            <button type="button" onClick={() => remove(pc)} className="text-muted-foreground hover:text-accent" aria-label={`Remove ${pc}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="Add postcode (e.g. 1211)"
          inputMode="numeric"
          maxLength={4}
          className="flex-1 rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory"
        />
        <button type="button" onClick={add} className="rounded-full gold-border px-3 py-2 text-xs text-ivory hover:bg-gold/10 flex items-center gap-1">
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>
    </div>
  );
};

const emptyDraft = (): Partial<Zone> => ({
  area: "", postcodes: [], min_order_value: 20, delivery_fee: 3.5, free_above: null, active: true,
});

const ZonesTab = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Partial<Zone>>(emptyDraft());

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("delivery_zones").select("*").order("area");
    setZones((data as Zone[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggleActive = async (zone: Zone, active: boolean) => {
    const { error } = await supabase.from("delivery_zones").update({ active }).eq("id", zone.id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else { toast({ title: active ? `${zone.area} resumed` : `${zone.area} paused` }); load(); }
  };

  const save = async () => {
    if (!draft.area?.trim()) { toast({ title: "Area name required", variant: "destructive" }); return; }
    if (!draft.postcodes?.length) { toast({ title: "Add at least one postcode", variant: "destructive" }); return; }

    if (editing === "new") {
      const { error } = await supabase.from("delivery_zones").insert({
        area: draft.area, postcodes: draft.postcodes,
        min_order_value: draft.min_order_value ?? 0, delivery_fee: draft.delivery_fee ?? 0,
        free_above: draft.free_above ?? null, active: draft.active ?? true,
      });
      if (error) { toast({ title: "Create failed", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Zone created" });
    } else if (editing) {
      const { error } = await supabase.from("delivery_zones").update({
        area: draft.area, postcodes: draft.postcodes,
        min_order_value: draft.min_order_value ?? 0, delivery_fee: draft.delivery_fee ?? 0,
        free_above: draft.free_above ?? null, active: draft.active ?? true,
      }).eq("id", editing);
      if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Zone updated" });
    }
    setEditing(null);
    setDraft(emptyDraft());
    load();
  };

  const remove = async (zone: Zone) => {
    if (!confirm(`Delete zone "${zone.area}" permanently? Tip: use the Pause toggle if you only want a temporary stop.`)) return;
    const { error } = await supabase.from("delivery_zones").delete().eq("id", zone.id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Zone deleted" }); load(); }
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-gold mx-auto mt-10" />;

  const renderEditor = (id: string | "new") => (
    <div className="rounded-xl gold-border bg-card/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-serif text-lg text-ivory">{id === "new" ? "New zone" : "Edit zone"}</h4>
        <label className="flex items-center gap-2 text-xs text-ivory">
          <Switch checked={draft.active ?? true} onCheckedChange={(v) => setDraft({ ...draft, active: v })} />
          {draft.active ? "Active" : "Paused"}
        </label>
      </div>
      <label className="block">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Area name</span>
        <input value={draft.area ?? ""} onChange={(e) => setDraft({ ...draft, area: e.target.value })}
          className="mt-1 w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory" />
      </label>
      <div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Postcodes</span>
        <div className="mt-1">
          <PostcodeChips
            postcodes={draft.postcodes ?? []}
            onChange={(next) => setDraft({ ...draft, postcodes: next })}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
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
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Free above (€)</span>
          <input type="number" step="0.5" value={draft.free_above ?? ""}
            onChange={(e) => setDraft({ ...draft, free_above: e.target.value ? parseFloat(e.target.value) : null })}
            className="mt-1 w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory" />
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={save} className="rounded-full bg-gradient-gold px-4 py-2 text-xs font-semibold text-ink flex items-center gap-1.5">
          <Save className="h-3.5 w-3.5" /> {id === "new" ? "Create zone" : "Save changes"}
        </button>
        <button onClick={() => { setEditing(null); setDraft(emptyDraft()); }} className="rounded-full gold-border px-4 py-2 text-xs text-ivory flex items-center gap-1.5">
          <X className="h-3.5 w-3.5" /> Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {editing !== "new" && (
          <button
            onClick={() => { setEditing("new"); setDraft(emptyDraft()); }}
            className="rounded-full bg-gradient-gold px-4 py-2 text-xs font-semibold text-ink flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Create new zone
          </button>
        )}
      </div>

      {editing === "new" && renderEditor("new")}

      {zones.map((z) => {
        const isEditing = editing === z.id;
        if (isEditing) return <div key={z.id}>{renderEditor(z.id)}</div>;
        return (
          <div key={z.id} className={`rounded-xl gold-border bg-card/40 p-4 ${!z.active ? "opacity-70" : ""}`}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-serif text-base text-ivory">{z.area}</span>
                  {!z.active && <span className="text-[10px] uppercase tracking-widest text-accent rounded-full bg-accent/15 px-2 py-0.5">Paused</span>}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {z.postcodes.map((pc) => (
                    <span key={pc} className="rounded-full bg-ink/70 border border-gold/20 px-2 py-0.5 text-[11px] text-ivory/80">{pc}</span>
                  ))}
                </div>
              </div>
              <div className="text-right text-xs text-ivory/80">
                <div>min €{Number(z.min_order_value).toFixed(2)}</div>
                <div className="text-gold">€{Number(z.delivery_fee).toFixed(2)}{z.free_above ? ` · free €${Number(z.free_above).toFixed(0)}+` : ""}</div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-[11px] text-ivory/80">
                  <Switch checked={z.active} onCheckedChange={(v) => toggleActive(z, v)} />
                  {z.active ? "Active" : "Paused"}
                </label>
                <button onClick={() => { setEditing(z.id); setDraft(z); }} className="rounded-full gold-border p-2 text-ivory hover:bg-gold/10" aria-label="Edit">
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => remove(z)} className="rounded-full gold-border p-2 text-ivory hover:bg-accent/15 hover:text-accent" aria-label="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* -------------------- Orders / Seed (unchanged) -------------------- */
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

  const updateStatus = async (id: string, status: OrderStatus) => {
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
                onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                className="mt-1 rounded-full gold-border bg-ink px-3 py-1 text-xs text-ivory"
              >
                {(["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"] as const).map((s) => (
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

/* -------------------- Admin Emails -------------------- */
interface AdminEmail { id: string; email: string; created_at: string }

const AdminEmailsTab = () => {
  const [list, setList] = useState<AdminEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("admin_emails").select("*").order("created_at", { ascending: false });
    setList((data as AdminEmail[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid email", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("admin_emails").insert({ email });
    setSaving(false);
    if (error) {
      toast({ title: "Add failed", description: error.message, variant: "destructive" });
      return;
    }
    // Promote any matching existing user to admin immediately
    const { data: matchedProfile } = await supabase.from("profiles").select("user_id").eq("email", email).maybeSingle();
    if (matchedProfile?.user_id) {
      await supabase.from("user_roles").insert({ user_id: matchedProfile.user_id, role: "admin" }).then(() => {});
    }
    toast({ title: "Admin email added" });
    setNewEmail("");
    load();
  };

  const remove = async (row: AdminEmail) => {
    if (!confirm(`Revoke admin access for ${row.email}?`)) return;
    const { error } = await supabase.from("admin_emails").delete().eq("id", row.id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    // Also revoke role for any matching user
    const { data: matchedProfile } = await supabase.from("profiles").select("user_id").eq("email", row.email).maybeSingle();
    if (matchedProfile?.user_id) {
      await supabase.from("user_roles").delete().eq("user_id", matchedProfile.user_id).eq("role", "admin");
    }
    toast({ title: "Admin removed" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl gold-border bg-card/40 p-6">
        <h3 className="font-serif text-2xl text-ivory mb-1">Admin access list</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Only people with their email on this list can sign in to <code className="text-gold">/admin</code>. New signups matching these emails are auto-promoted.
        </p>
        <form onSubmit={add} className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="email@example.com"
            className="flex-1 rounded-full gold-border bg-ink px-4 py-2 text-sm text-ivory"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-gradient-gold px-4 py-2 text-xs font-semibold text-ink flex items-center gap-1.5 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </form>
      </div>

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-gold mx-auto mt-10" />
      ) : !list.length ? (
        <div className="rounded-xl gold-border p-8 text-center text-muted-foreground">No approved admin emails.</div>
      ) : (
        <div className="space-y-2">
          {list.map((row) => (
            <div key={row.id} className="rounded-xl gold-border bg-card/40 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <ShieldCheck className="h-4 w-4 text-gold shrink-0" />
                <span className="text-sm text-ivory truncate">{row.email}</span>
              </div>
              <button
                onClick={() => remove(row)}
                className="rounded-full gold-border p-2 text-ivory hover:bg-accent/15 hover:text-accent"
                aria-label="Revoke admin"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* -------------------- Announcements / Promo Bars -------------------- */
interface Announcement {
  id: string;
  message: string;
  link_url: string | null;
  active: boolean;
  display_order: number;
  bg_color: string | null;
  text_color: string | null;
  starts_at: string | null;
  ends_at: string | null;
}

const emptyAnn: Omit<Announcement, "id"> = {
  message: "",
  link_url: "",
  active: true,
  display_order: 0,
  bg_color: "",
  text_color: "",
  starts_at: null,
  ends_at: null,
};

const AnnouncementsTab = () => {
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [draft, setDraft] = useState<Omit<Announcement, "id">>(emptyAnn);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    setList((data as Announcement[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing(null); setDraft(emptyAnn); };
  const startEdit = (a: Announcement) => {
    setEditing(a);
    setDraft({
      message: a.message,
      link_url: a.link_url ?? "",
      active: a.active,
      display_order: a.display_order,
      bg_color: a.bg_color ?? "",
      text_color: a.text_color ?? "",
      starts_at: a.starts_at,
      ends_at: a.ends_at,
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.message.trim()) {
      toast({ title: "Message required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      message: draft.message.trim(),
      link_url: draft.link_url?.trim() || null,
      active: draft.active,
      display_order: Number(draft.display_order) || 0,
      bg_color: draft.bg_color?.trim() || null,
      text_color: draft.text_color?.trim() || null,
      starts_at: draft.starts_at || null,
      ends_at: draft.ends_at || null,
    };
    const { error } = editing
      ? await supabase.from("announcements").update(payload).eq("id", editing.id)
      : await supabase.from("announcements").insert(payload);
    setSaving(false);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Banner updated" : "Banner created" });
    startNew();
    load();
  };

  const toggleActive = async (a: Announcement) => {
    const { error } = await supabase.from("announcements").update({ active: !a.active }).eq("id", a.id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else load();
  };

  const remove = async (a: Announcement) => {
    if (!confirm("Delete this banner?")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", a.id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Banner deleted" }); load(); }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl gold-border bg-card/40 p-6">
        <h3 className="font-serif text-2xl text-ivory mb-1">
          {editing ? "Edit banner" : "New banner"}
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          Banners show on top of the website. Toggle them on/off, set colors, link, and optional start/end dates. Multiple active banners rotate every 5 seconds.
        </p>
        <form onSubmit={save} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Message *</label>
            <input
              value={draft.message}
              onChange={(e) => setDraft({ ...draft, message: e.target.value })}
              placeholder="Free delivery on orders over €30 — code DELHI10"
              className="w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Link URL (optional)</label>
              <input
                value={draft.link_url ?? ""}
                onChange={(e) => setDraft({ ...draft, link_url: e.target.value })}
                placeholder="https://... or /menu"
                className="w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Display order</label>
              <input
                type="number"
                value={draft.display_order}
                onChange={(e) => setDraft({ ...draft, display_order: Number(e.target.value) })}
                className="w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Background color (CSS)</label>
              <input
                value={draft.bg_color ?? ""}
                onChange={(e) => setDraft({ ...draft, bg_color: e.target.value })}
                placeholder="#111 or hsl(45 80% 55%) — leave blank for default gold"
                className="w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Text color (CSS)</label>
              <input
                value={draft.text_color ?? ""}
                onChange={(e) => setDraft({ ...draft, text_color: e.target.value })}
                placeholder="#fff"
                className="w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Starts at (optional)</label>
              <input
                type="datetime-local"
                value={draft.starts_at ? draft.starts_at.slice(0, 16) : ""}
                onChange={(e) => setDraft({ ...draft, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                className="w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Ends at (optional)</label>
              <input
                type="datetime-local"
                value={draft.ends_at ? draft.ends_at.slice(0, 16) : ""}
                onChange={(e) => setDraft({ ...draft, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                className="w-full rounded-lg gold-border bg-ink px-3 py-2 text-sm text-ivory"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={draft.active} onCheckedChange={(v) => setDraft({ ...draft, active: v })} />
            <span className="text-sm text-ivory">Active (visible on site)</span>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-gradient-gold px-5 py-2 text-sm font-semibold text-ink flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {editing ? "Update banner" : "Create banner"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={startNew}
                className="rounded-full gold-border px-5 py-2 text-sm text-ivory"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-gold mx-auto mt-10" />
      ) : !list.length ? (
        <div className="rounded-xl gold-border p-8 text-center text-muted-foreground">No banners yet.</div>
      ) : (
        <div className="space-y-2">
          {list.map((a) => (
            <div key={a.id} className="rounded-xl gold-border bg-card/40 p-4 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div
                  className="rounded px-3 py-1.5 text-xs font-semibold inline-block max-w-full truncate"
                  style={{
                    background: a.bg_color || "linear-gradient(90deg, hsl(45 80% 55%), hsl(40 75% 50%))",
                    color: a.text_color || "#1a1a1a",
                  }}
                  title={a.message}
                >
                  {a.message}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Order {a.display_order} · {a.active ? "Active" : "Hidden"}
                  {a.link_url ? ` · → ${a.link_url}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleActive(a)}
                  className="rounded-full gold-border p-2 text-ivory hover:bg-gold/10"
                  aria-label={a.active ? "Hide" : "Show"}
                  title={a.active ? "Hide" : "Show"}
                >
                  {a.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => startEdit(a)}
                  className="rounded-full gold-border p-2 text-ivory hover:bg-gold/10"
                  aria-label="Edit"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => remove(a)}
                  className="rounded-full gold-border p-2 text-ivory hover:bg-accent/15 hover:text-accent"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full max-w-5xl grid-cols-7 bg-ink-soft border border-gold/15">
          <TabsTrigger value="status" className="data-[state=active]:bg-gradient-gold data-[state=active]:text-ink">
            <Settings className="h-3.5 w-3.5 mr-1.5" /> Status
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-gradient-gold data-[state=active]:text-ink">
            <ShoppingBag className="h-3.5 w-3.5 mr-1.5" /> Orders
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-gradient-gold data-[state=active]:text-ink">
            <Package className="h-3.5 w-3.5 mr-1.5" /> Products
          </TabsTrigger>
          <TabsTrigger value="zones" className="data-[state=active]:bg-gradient-gold data-[state=active]:text-ink">
            <MapPin className="h-3.5 w-3.5 mr-1.5" /> Zones
          </TabsTrigger>
          <TabsTrigger value="admins" className="data-[state=active]:bg-gradient-gold data-[state=active]:text-ink">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Admins
          </TabsTrigger>
          <TabsTrigger value="banners" className="data-[state=active]:bg-gradient-gold data-[state=active]:text-ink">
            <Megaphone className="h-3.5 w-3.5 mr-1.5" /> Banners
          </TabsTrigger>
          <TabsTrigger value="seed" className="data-[state=active]:bg-gradient-gold data-[state=active]:text-ink">
            Seed
          </TabsTrigger>
        </TabsList>
        <TabsContent value="status" className="mt-6"><StoreStatusTab /></TabsContent>
        <TabsContent value="orders" className="mt-6"><OrdersTab /></TabsContent>
        <TabsContent value="products" className="mt-6"><ProductsTab /></TabsContent>
        <TabsContent value="zones" className="mt-6"><ZonesTab /></TabsContent>
        <TabsContent value="admins" className="mt-6"><AdminEmailsTab /></TabsContent>
        <TabsContent value="banners" className="mt-6"><AnnouncementsTab /></TabsContent>
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
