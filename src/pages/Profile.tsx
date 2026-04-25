import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { I18nProvider } from "@/contexts/I18nContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, ArrowLeft } from "lucide-react";

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  method: string;
  total: number;
  created_at: string;
  payment_status: string | null;
}

interface ProfileRow {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postcode: string | null;
}

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    pending_payment: "bg-accent/15 text-accent",
    confirmed: "bg-emerald-500/15 text-emerald-400",
    preparing: "bg-gold/15 text-gold",
    out_for_delivery: "bg-blue-500/15 text-blue-400",
    delivered: "bg-emerald-500/15 text-emerald-400",
    cancelled: "bg-destructive/15 text-destructive",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-widest ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
};

const ProfileInner = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [ordersRes, profileRes] = await Promise.all([
        supabase.from("orders")
          .select("id, order_number, status, method, total, created_at, payment_status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("first_name, last_name, phone, address, city, postcode").eq("user_id", user.id).maybeSingle(),
      ]);
      setOrders((ordersRes.data as OrderRow[]) ?? []);
      setProfile((profileRes.data as ProfileRow) ?? null);
      setLoading(false);
    })();
  }, [user]);

  return (
    <main className="mx-auto max-w-4xl px-6 pt-32 pb-24">
      <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold hover:text-gold-glow">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to menu
      </Link>

      <h1 className="mt-6 font-serif text-4xl text-ivory">My account</h1>
      <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>

      {/* Saved details */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl text-ivory mb-3">Saved details</h2>
        {profile ? (
          <div className="rounded-xl gold-border bg-card/40 p-5 grid sm:grid-cols-2 gap-3 text-sm text-ivory/90">
            <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Name</div>{[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "—"}</div>
            <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Phone</div>{profile.phone || "—"}</div>
            <div className="sm:col-span-2"><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Address</div>{profile.address || "—"}</div>
            <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">City</div>{profile.city || "—"}</div>
            <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Postcode</div>{profile.postcode || "—"}</div>
          </div>
        ) : (
          <div className="rounded-xl gold-border p-6 text-sm text-muted-foreground">
            No saved details yet — they'll be auto-filled from your next order.
          </div>
        )}
      </section>

      {/* Orders */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl text-ivory mb-3 flex items-center gap-2">
          <Package className="h-5 w-5 text-gold" /> Order history
        </h2>

        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-gold mx-auto mt-10" />
        ) : !orders.length ? (
          <div className="rounded-xl gold-border p-8 text-center text-muted-foreground">
            You haven't placed any orders yet.
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o.id} className="rounded-xl gold-border bg-card/40 p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-gold">{o.order_number}</span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{o.method}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {new Date(o.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gold font-medium text-lg">€{Number(o.total).toFixed(2)}</div>
                  {o.payment_status && (
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                      {o.payment_status}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

const Profile = () => (
  <I18nProvider>
    <AuthProvider>
      <CartProvider>
        <ProtectedRoute>
          <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <ProfileInner />
            <Footer />
          </div>
        </ProtectedRoute>
      </CartProvider>
    </AuthProvider>
  </I18nProvider>
);

export default Profile;
