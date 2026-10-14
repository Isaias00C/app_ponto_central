import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { Size } from '@/constants/sizes';
import type { StockItem } from '@/lib/shirts';

type CartContextValue = {
  items: StockItem[];
  totalUnits: number;
  quantityOf: (shirtId: string, size: Size) => number;
  /** Define a quantidade do item no carrinho; 0 (ou menos) remove o item. */
  setQuantity: (shirtId: string, size: Size, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<StockItem[]>([]);

  const setQuantity = useCallback((shirtId: string, size: Size, quantity: number) => {
    setItems((current) => {
      const index = current.findIndex((item) => item.shirtId === shirtId && item.size === size);

      if (quantity <= 0) return index === -1 ? current : current.filter((_, i) => i !== index);
      if (index === -1) return [...current, { shirtId, size, quantity }];
      return current.map((item, i) => (i === index ? { ...item, quantity } : item));
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalUnits: items.reduce((sum, item) => sum + item.quantity, 0),
      quantityOf: (shirtId, size) =>
        items.find((item) => item.shirtId === shirtId && item.size === size)?.quantity ?? 0,
      setQuantity,
      clear,
    }),
    [items, setQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart deve ser usado dentro de <CartProvider>.');
  return context;
}
