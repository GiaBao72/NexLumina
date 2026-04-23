'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { MockCourse } from '@/lib/mock-data';

// ── Types ─────────────────────────────────────────────────────────────────────
export type CartItem = Pick<
  MockCourse,
  'id' | 'title' | 'slug' | 'category' | 'price' | 'salePrice' | 'gradient' | 'badge' | 'rating' | 'totalLessons' | 'totalDuration'
>;

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  hasItem: (id: string) => boolean;
  clearCart: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────
const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'nexlumina_cart';

// ── Provider ──────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Rehydrate from localStorage on mount (client only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota errors
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev; // no duplicates
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const hasItem = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = items.reduce(
    (sum, item) =>
      sum + (item.salePrice !== undefined && item.salePrice !== null && item.salePrice >= 0
        ? item.salePrice
        : item.price),
    0,
  );

  return (
    <CartContext.Provider
      value={{ items, count: items.length, subtotal, addItem, removeItem, hasItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
