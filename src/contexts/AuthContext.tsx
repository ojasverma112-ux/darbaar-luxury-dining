import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncSession = async (newSession: Session | null) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (!newSession?.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", newSession.user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!data);
      setLoading(false);
    };

    // Set up listener FIRST to avoid missing events
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setLoading(true);
      setTimeout(() => { void syncSession(newSession); }, 0);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      void syncSession(existing);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      session,
      loading,
      isAdmin,
      signOut: async () => {
        await supabase.auth.signOut({ scope: "global" });
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      },
    }),
    [user, session, loading, isAdmin]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
