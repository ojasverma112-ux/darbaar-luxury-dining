import { useEffect, useMemo, useRef, useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Bell, BellOff, Clock } from "lucide-react";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "pending_payment";

interface KitchenOrder {
  id: string;
  order_number: string;
  status: OrderStatus;
  method: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  total: number;
  notes: string | null;
  created_at: string;
  delivery_time: string | null;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
}

const NEW_STATUSES: OrderStatus[] = ["pending", "confirmed"];
const COOKING_STATUSES: OrderStatus[] = ["preparing"];
const READY_STATUSES: OrderStatus[] = ["out_for_delivery"];

const COLUMNS: { key: "new" | "cooking" | "ready"; title: string; statuses: OrderStatus[] }[] = [
  { key: "new", title: "New", statuses: NEW_STATUSES },
  { key: "cooking", title: "Cooking", statuses: COOKING_STATUSES },
  { key: "ready", title: "Ready", statuses: READY_STATUSES },
];

// Encoded short, loud "ding" tone via WebAudio (no asset required)
function playDing() {
  try {
    const AC: typeof AudioContext =
      (window as unknown as { AudioContext: typeof AudioContext; webkitAudioContext: typeof AudioContext })
        .AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const now = ctx.currentTime;

    const ring = (freq: number, start: number, dur: number, gain: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + start);
      g.gain.setValueAtTime(0, now + start);
      g.gain.linearRampToValueAtTime(gain, now + start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    };

    // Bright two-tone "ding ding"
    ring(1760, 0.0, 0.45, 0.5);
    ring(2349, 0.05, 0.4, 0.45);
    ring(1760, 0.55, 0.5, 0.5);
    ring(2349, 0.6, 0.45, 0.45);

    setTimeout(() => ctx.close().catch(() => {}), 1500);
  } catch {
    // ignore
  }
}

const fmtTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const minutesAgo = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 60000));
};

const Board = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [items, setItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const soundOnRef = useRef(true);
  const seenIds = useRef<Set<string>>(new Set());
  const initialLoadDone = useRef(false);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  const loadItems = async (orderIds: string[]) => {
    if (orderIds.length === 0) return;
    const { data } = await supabase
      .from("order_items")
      .select("id, order_id, product_name, quantity")
      .in("order_id", orderIds);
    if (data) {
      setItems((prev) => {
        const next = { ...prev };
        for (const it of data as OrderItem[]) {
          if (!next[it.order_id]) next[it.order_id] = [];
          if (!next[it.order_id].some((x) => x.id === it.id)) {
            next[it.order_id] = [...next[it.order_id], it];
          }
        }
        return next;
      });
    }
  };

  const fetchOrders = async () => {
    const activeStatuses = [...NEW_STATUSES, ...COOKING_STATUSES, ...READY_STATUSES];
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, order_number, status, method, customer_first_name, customer_last_name, customer_phone, total, notes, created_at, delivery_time"
      )
      .in("status", activeStatuses)
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Failed to load orders", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const list = (data ?? []) as KitchenOrder[];
    setOrders(list);
    list.forEach((o) => seenIds.current.add(o.id));
    await loadItems(list.map((o) => o.id));
    initialLoadDone.current = true;
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          const o = payload.new as KitchenOrder;
          if (![...NEW_STATUSES, ...COOKING_STATUSES, ...READY_STATUSES].includes(o.status)) return;
          if (seenIds.current.has(o.id)) return;
          seenIds.current.add(o.id);

          setOrders((prev) => [...prev, o]);
          await loadItems([o.id]);

          if (initialLoadDone.current && soundOnRef.current) {
            playDing();
            toast({
              title: "🔔 New order!",
              description: `#${o.order_number} · ${o.customer_first_name} ${o.customer_last_name}`,
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const o = payload.new as KitchenOrder;
          setOrders((prev) => {
            const exists = prev.some((p) => p.id === o.id);
            const active = [...NEW_STATUSES, ...COOKING_STATUSES, ...READY_STATUSES].includes(
              o.status
            );
            if (!active) return prev.filter((p) => p.id !== o.id);
            if (!exists) {
              seenIds.current.add(o.id);
              return [...prev, o];
            }
            return prev.map((p) => (p.id === o.id ? { ...p, ...o } : p));
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "orders" },
        (payload) => {
          const o = payload.old as { id: string };
          setOrders((prev) => prev.filter((p) => p.id !== o.id));
          seenIds.current.delete(o.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advance = async (order: KitchenOrder) => {
    let next: OrderStatus | null = null;
    if (NEW_STATUSES.includes(order.status)) next = "preparing";
    else if (COOKING_STATUSES.includes(order.status)) next = "out_for_delivery";
    else if (READY_STATUSES.includes(order.status))
      next = order.method === "pickup" ? "delivered" : "delivered";
    if (!next) return;

    const { error } = await supabase.from("orders").update({ status: next }).eq("id", order.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  };

  const cancel = async (order: KitchenOrder) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order.id);
    if (error) {
      toast({ title: "Cancel failed", description: error.message, variant: "destructive" });
    }
  };

  const grouped = useMemo(() => {
    const g: Record<string, KitchenOrder[]> = { new: [], cooking: [], ready: [] };
    for (const o of orders) {
      if (NEW_STATUSES.includes(o.status)) g.new.push(o);
      else if (COOKING_STATUSES.includes(o.status)) g.cooking.push(o);
      else if (READY_STATUSES.includes(o.status)) g.ready.push(o);
    }
    for (const k of Object.keys(g)) {
      g[k].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    return g;
  }, [orders]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-ivory">Kitchen Board</h1>
            <p className="text-xs text-muted-foreground">
              Live orders · updates instantly via realtime
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const next = !soundOn;
              setSoundOn(next);
              if (next) playDing();
            }}
          >
            {soundOn ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
            Sound: {soundOn ? "On" : "Off"}
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-6">
        {loading ? (
          <div className="text-muted-foreground">Loading orders…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COLUMNS.map((col) => (
              <div key={col.key} className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="font-serif text-lg text-ivory">{col.title}</h2>
                  <Badge variant="secondary">{grouped[col.key].length}</Badge>
                </div>
                <div className="flex flex-col gap-3 min-h-[200px]">
                  {grouped[col.key].length === 0 && (
                    <div className="text-xs text-muted-foreground italic px-1">No orders</div>
                  )}
                  {grouped[col.key].map((o) => {
                    const its = items[o.id] ?? [];
                    const age = minutesAgo(o.created_at);
                    const urgent = age >= 15 && col.key !== "ready";
                    return (
                      <Card
                        key={o.id}
                        className={`p-4 ${urgent ? "border-destructive" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-mono text-sm font-semibold">
                            #{o.order_number}
                          </div>
                          <Badge variant={urgent ? "destructive" : "outline"}>
                            <Clock className="h-3 w-3 mr-1" />
                            {age}m
                          </Badge>
                        </div>
                        <div className="mt-1 text-sm">
                          {o.customer_first_name} {o.customer_last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {o.method.toUpperCase()} · {fmtTime(o.created_at)}
                          {o.delivery_time ? ` · ${o.delivery_time}` : ""}
                        </div>
                        <ul className="mt-3 space-y-1 text-sm">
                          {its.map((it) => (
                            <li key={it.id} className="flex justify-between">
                              <span>{it.product_name}</span>
                              <span className="text-muted-foreground">×{it.quantity}</span>
                            </li>
                          ))}
                          {its.length === 0 && (
                            <li className="text-xs text-muted-foreground italic">
                              Loading items…
                            </li>
                          )}
                        </ul>
                        {o.notes && (
                          <div className="mt-2 text-xs italic text-muted-foreground border-l-2 border-gold pl-2">
                            “{o.notes}”
                          </div>
                        )}
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="text-sm font-semibold text-gold">
                            €{Number(o.total).toFixed(2)}
                          </div>
                          <div className="flex gap-2">
                            {col.key !== "ready" ? (
                              <Button size="sm" variant="ghost" onClick={() => cancel(o)}>
                                Cancel
                              </Button>
                            ) : null}
                            <Button size="sm" onClick={() => advance(o)}>
                              {col.key === "new"
                                ? "Start cooking"
                                : col.key === "cooking"
                                ? "Mark ready"
                                : "Complete"}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

const StaffGate = ({ children }: { children: React.ReactNode }) => {
  // Reuse admin role for staff access (admin emails approved in dashboard)
  return <ProtectedRoute requireAdmin>{children}</ProtectedRoute>;
};

const Kitchen = () => (
  <AuthProvider>
    <StaffGate>
      <Board />
    </StaffGate>
  </AuthProvider>
);

export default Kitchen;
