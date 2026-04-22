import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { MenuItem } from "@/data/menu";

export interface CartLine {
  item: MenuItem;
  qty: number;
}

interface CartCtx {
  lines: CartLine[];
  add: (item: MenuItem) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  count: number;
  subtotal: number;
}

const Ctx = createContext<CartCtx | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [lines, setLines] = useState<CartLine[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("dd.cart");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("dd.cart", JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<CartCtx>(() => ({
    lines,
    add: (item) => {
      setLines((prev) => {
        const found = prev.find((l) => l.item.id === item.id);
        if (found) return prev.map((l) => l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l);
        return [...prev, { item, qty: 1 }];
      });
      setOpen(true);
    },
    remove: (id) => setLines((prev) => prev.filter((l) => l.item.id !== id)),
    setQty: (id, qty) => setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.item.id !== id) : prev.map((l) => l.item.id === id ? { ...l, qty } : l)
    ),
    clear: () => setLines([]),
    isOpen,
    openCart: () => setOpen(true),
    closeCart: () => setOpen(false),
    count: lines.reduce((s, l) => s + l.qty, 0),
    subtotal: lines.reduce((s, l) => s + l.qty * l.item.price, 0),
  }), [lines, isOpen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useCart = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
