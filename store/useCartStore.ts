import { create } from 'zustand';
import { CategoryType, OrderType, PaymentMethod } from '@/types/database';

export interface CartItem {
  menu_id: string;
  name: string;
  price: number;
  quantity: number;
  category_type: CategoryType;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  customer_name: string;
  order_type: OrderType;
  payment_method: PaymentMethod;
  cash_received: number;

  setCustomerName: (name: string) => void;
  setOrderType: (type: OrderType) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setCashReceived: (amount: number) => void;

  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (menu_id: string) => void;
  updateQuantity: (menu_id: string, delta: number) => void;
  updateNotes: (menu_id: string, notes: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customer_name: '',
  order_type: 'dine_in',
  payment_method: 'cash',
  cash_received: 0,

  setCustomerName: (name) => set({ customer_name: name }),
  setOrderType: (type) => set({ order_type: type }),
  setPaymentMethod: (method) => set({ payment_method: method }),
  setCashReceived: (amount) => set({ cash_received: amount }),

  addItem: (newItem) => {
    set((state) => {
      const existing = state.items.find((i) => i.menu_id === newItem.menu_id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.menu_id === newItem.menu_id ? { ...i, quantity: i.quantity + 1 } : i
          )
        };
      }
      return {
        items: [...state.items, { ...newItem, quantity: 1, notes: newItem.notes || '' }]
      };
    });
  },

  removeItem: (menu_id) => {
    set((state) => ({
      items: state.items.filter((i) => i.menu_id !== menu_id)
    }));
  },

  updateQuantity: (menu_id, delta) => {
    set((state) => {
      const updated = state.items
        .map((i) => {
          if (i.menu_id === menu_id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
      return { items: updated };
    });
  },

  updateNotes: (menu_id, notes) => {
    set((state) => ({
      items: state.items.map((i) => (i.menu_id === menu_id ? { ...i, notes } : i))
    }));
  },

  clearCart: () =>
    set({
      items: [],
      customer_name: '',
      order_type: 'dine_in',
      payment_method: 'cash',
      cash_received: 0
    }),

  getTotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}));
