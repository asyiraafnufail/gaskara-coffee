import { supabase, isSupabaseConfigured } from './supabase';
import { Category, Menu, Order, OrderItem, FinancialReport, CategoryType } from '@/types/database';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1111111-1111-1111-1111-111111111111', name: 'Coffee', type: 'coffee', created_at: new Date().toISOString() },
  { id: 'c2222222-2222-2222-2222-222222222222', name: 'Non-Coffee', type: 'non_coffee', created_at: new Date().toISOString() },
  { id: 'c3333333-3333-3333-3333-333333333333', name: 'Snack', type: 'snack', created_at: new Date().toISOString() }
];

export const INITIAL_MENUS: Menu[] = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Kopi Susu Gaskara',
    description: 'Espresso blend khas Gaskara dengan susu creamy dan gula aren organik.',
    price: 22000,
    image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop',
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Americano',
    description: 'Double shot espresso dengan air mineral dingin/panas, body tebal dan clean.',
    price: 18000,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b3333333-3333-3333-3333-333333333333',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Vanilla Latte',
    description: 'Espresso lembut berpadu susu segar dan sirup vanilla Madagaskar.',
    price: 25000,
    image_url: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?q=80&w=600&auto=format&fit=crop',
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b4444444-4444-4444-4444-444444444444',
    category_id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Matcha Latte',
    description: 'Pure Uji matcha Jepang dengan steamed milk gurih dan seimbang.',
    price: 26000,
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600&auto=format&fit=crop',
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b5555555-5555-5555-5555-555555555555',
    category_id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Earl Grey Milk Tea',
    description: 'Seduhan black tea beraroma bergamot dengan susu segar manis ringan.',
    price: 23000,
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop',
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b6666666-6666-6666-6666-666666666666',
    category_id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Butter Croissant',
    description: 'Flaky pastry Prancis berlapis butter premium, renyah di luar lembut di dalam.',
    price: 20000,
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop',
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b7777777-7777-7777-7777-777777777777',
    category_id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Truffle French Fries',
    description: 'Kentang goreng renyah dengan taburan garam laut dan minyak truffle aromatik.',
    price: 24000,
    image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop',
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const LOCAL_STORAGE_KEY_MENUS = 'gaskara_menus';
const LOCAL_STORAGE_KEY_ORDERS = 'gaskara_orders';

function getLocalMenus(): Menu[] {
  if (typeof window === 'undefined') return INITIAL_MENUS;
  const data = localStorage.getItem(LOCAL_STORAGE_KEY_MENUS);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY_MENUS, JSON.stringify(INITIAL_MENUS));
    return INITIAL_MENUS;
  }
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.some((m: Menu) => m.id === 'm-1' || m.category_id === 'cat-1')) {
      localStorage.setItem(LOCAL_STORAGE_KEY_MENUS, JSON.stringify(INITIAL_MENUS));
      return INITIAL_MENUS;
    }
    return parsed;
  } catch {
    return INITIAL_MENUS;
  }
}

function setLocalMenus(menus: Menu[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY_MENUS, JSON.stringify(menus));
  window.dispatchEvent(new CustomEvent('gaskara_menu_updated'));
}

const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'ord-demo-1',
    daily_queue_number: 1,
    order_code: 'GSK-001',
    customer_name: 'Dimas',
    order_type: 'dine_in',
    order_source: 'pos',
    payment_method: 'cash',
    payment_status: 'paid',
    order_status: 'ready',
    total_amount: 38000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order_items: []
  },
  {
    id: 'ord-demo-2',
    daily_queue_number: 2,
    order_code: 'GSK-002',
    customer_name: 'Anisa',
    order_type: 'takeaway',
    order_source: 'web',
    payment_method: 'qris',
    payment_status: 'paid',
    order_status: 'preparing',
    total_amount: 22000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order_items: []
  }
];

function getLocalOrders(): Order[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_ORDERS;
  const data = localStorage.getItem(LOCAL_STORAGE_KEY_ORDERS);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY_ORDERS, JSON.stringify(INITIAL_DEMO_ORDERS));
    return INITIAL_DEMO_ORDERS;
  }
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : INITIAL_DEMO_ORDERS;
  } catch {
    return INITIAL_DEMO_ORDERS;
  }
}

function setLocalOrders(orders: Order[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY_ORDERS, JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent('gaskara_order_updated'));
}

const CATEGORY_WEIGHT: Record<string, number> = {
  coffee: 1,
  non_coffee: 2,
  snack: 3
};

function sortMenusByCategory(list: Menu[]): Menu[] {
  return [...list].sort((a, b) => {
    const typeA =
      a.category?.type ||
      (a.category_id === 'c1111111-1111-1111-1111-111111111111'
        ? 'coffee'
        : a.category_id === 'c2222222-2222-2222-2222-222222222222'
        ? 'non_coffee'
        : 'snack');
    const typeB =
      b.category?.type ||
      (b.category_id === 'c1111111-1111-1111-1111-111111111111'
        ? 'coffee'
        : b.category_id === 'c2222222-2222-2222-2222-222222222222'
        ? 'non_coffee'
        : 'snack');
    const wA = CATEGORY_WEIGHT[typeA] ?? 99;
    const wB = CATEGORY_WEIGHT[typeB] ?? 99;
    if (wA !== wB) return wA - wB;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

export async function fetchMenus(): Promise<Menu[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('menus')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: true });
    if (!error && data && data.length > 0) {
      return sortMenusByCategory(data);
    }
  }
  const menus = getLocalMenus();
  const mapped = menus.map((m) => {
    const cat = INITIAL_CATEGORIES.find((c) => c.id === m.category_id);
    return { ...m, category: cat };
  });
  return sortMenusByCategory(mapped);
}

export async function fetchCategories(): Promise<Category[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (!error && data && data.length > 0) return data;
  }
  return INITIAL_CATEGORIES;
}

export async function addMenu(payload: {
  name: string;
  price: number;
  category_id: string;
  description?: string;
  image_url?: string;
  is_available?: boolean;
}): Promise<Menu> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('menus')
      .insert({
        name: payload.name,
        price: payload.price,
        category_id: payload.category_id,
        description: payload.description || null,
        image_url: payload.image_url || null,
        is_available: payload.is_available ?? true,
        created_at: now,
        updated_at: now
      })
      .select('*, category:categories(*)')
      .single();
    if (!error && data) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gaskara_menu_updated'));
      }
      return data;
    }
  }

  const menus = getLocalMenus();
  const cat = INITIAL_CATEGORIES.find((c) => c.id === payload.category_id);
  const newMenu: Menu = {
    id: `m-${Date.now()}`,
    name: payload.name,
    price: payload.price,
    category_id: payload.category_id,
    description: payload.description || null,
    image_url: payload.image_url || null,
    is_available: payload.is_available ?? true,
    created_at: now,
    updated_at: now,
    category: cat
  };
  setLocalMenus([...menus, newMenu]);
  return newMenu;
}

export async function updateMenu(
  id: string,
  payload: {
    name?: string;
    price?: number;
    category_id?: string;
    description?: string;
    image_url?: string;
    is_available?: boolean;
  }
): Promise<Menu | null> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('menus')
      .update({
        ...payload,
        updated_at: now
      })
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();
    if (!error && data) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gaskara_menu_updated'));
      }
      return data;
    }
  }

  const menus = getLocalMenus();
  const index = menus.findIndex((m) => m.id === id);
  if (index === -1) return null;

  const targetCategory = payload.category_id
    ? INITIAL_CATEGORIES.find((c) => c.id === payload.category_id)
    : menus[index].category;

  const updatedMenu: Menu = {
    ...menus[index],
    ...payload,
    category: targetCategory,
    updated_at: now
  };

  const updatedMenus = [...menus];
  updatedMenus[index] = updatedMenu;
  setLocalMenus(updatedMenus);
  return updatedMenu;
}

export async function deleteMenu(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('menus').delete().eq('id', id);
    if (!error) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gaskara_menu_updated'));
      }
      return true;
    }
  }
  const menus = getLocalMenus();
  const updated = menus.filter((m) => m.id !== id);
  setLocalMenus(updated);
  return true;
}

export async function toggleMenuAvailability(id: string, is_available: boolean): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from('menus')
      .update({ is_available, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) return true;
  }
  const menus = getLocalMenus();
  const updated = menus.map((m) => (m.id === id ? { ...m, is_available, updated_at: new Date().toISOString() } : m));
  setLocalMenus(updated);
  return true;
}

export async function fetchOrders(): Promise<Order[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, menu:menus(*))')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data;
      }
      if (error) {
        console.error('Supabase fetchOrders error:', error);
      }
    } catch (err) {
      console.error('Supabase fetchOrders exception:', err);
    }
  }
  return getLocalOrders();
}

export async function fetchOrderByCode(order_code: string): Promise<Order | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, menu:menus(*))')
        .eq('order_code', order_code)
        .single();
      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.error('Supabase fetchOrderByCode exception:', err);
    }
  }
  const orders = getLocalOrders();
  return orders.find((o) => o.order_code === order_code) || null;
}

export async function createOrder(payload: {
  customer_name: string;
  order_type: 'dine_in' | 'takeaway';
  order_source: 'pos' | 'web';
  payment_method: 'cash' | 'qris';
  payment_status: 'pending' | 'paid';
  order_status: 'received' | 'preparing';
  items: {
    menu_id: string;
    category_type?: CategoryType;
    quantity: number;
    unit_price: number;
    subtotal: number;
    notes?: string;
    menu_name?: string;
  }[];
}): Promise<Order> {
  const total_amount = payload.items.reduce((sum, item) => sum + item.subtotal, 0);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}${month}${day}`;
  const todayStart = new Date(year, now.getMonth(), now.getDate()).toISOString();

  // Helper validasi UUID PostgreSQL
  const isValidUUID = (str?: string) =>
    typeof str === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  if (isSupabaseConfigured()) {
    try {
      // 1. Dapatkan nomor antrian berikutnya untuk hari ini dari Supabase
      let nextQueueNum = 1;
      const { data: latestOrders, error: queueErr } = await supabase
        .from('orders')
        .select('daily_queue_number')
        .gte('created_at', todayStart)
        .order('daily_queue_number', { ascending: false })
        .limit(1);

      if (!queueErr && latestOrders && latestOrders.length > 0 && typeof latestOrders[0].daily_queue_number === 'number') {
        nextQueueNum = latestOrders[0].daily_queue_number + 1;
      }

      const orderCode = `GSK-${todayStr}-${String(nextQueueNum).padStart(3, '0')}`;

      // 2. Insert order dengan daily_queue_number & order_code eksplisit
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert({
          daily_queue_number: nextQueueNum,
          order_code: orderCode,
          customer_name: payload.customer_name,
          order_type: payload.order_type,
          order_source: payload.order_source,
          payment_method: payload.payment_method,
          payment_status: payload.payment_status,
          order_status: payload.order_status,
          total_amount
        })
        .select()
        .single();

      if (orderErr) {
        console.error('Supabase orders.insert error:', {
          message: orderErr.message,
          code: orderErr.code,
          details: orderErr.details,
          hint: orderErr.hint
        });
        throw new Error(orderErr.message || orderErr.details || 'Gagal menyimpan pesanan ke Supabase');
      }

      if (orderData) {
        // 3. Insert order_items dengan category_type terjamin
        const itemsToInsert = payload.items.map((item) => ({
          order_id: orderData.id,
          menu_id: isValidUUID(item.menu_id) ? item.menu_id : 'b1111111-1111-1111-1111-111111111111',
          category_type: (item.category_type || 'coffee') as CategoryType,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          notes: item.notes || null
        }));

        const { error: itemsErr } = await supabase.from('order_items').insert(itemsToInsert);
        if (itemsErr) {
          console.error('Supabase order_items.insert error:', itemsErr);
        }

        // Pemicu event sinkronisasi realtime lokal
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gaskara_order_updated'));
        }

        return orderData;
      }
    } catch (err: unknown) {
      console.error('createOrder Supabase exception:', (err as Error)?.message || err);
      throw err;
    }
  }

  // Local fallback with daily queue generator logic
  const orders = getLocalOrders();
  const todayOrders = orders.filter((o) => {
    const orderDate = new Date(o.created_at);
    const dStr = `${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}${String(
      orderDate.getDate()
    ).padStart(2, '0')}`;
    return dStr === todayStr;
  });

  const nextQueueNum = todayOrders.length + 1;
  const orderCode = `GSK-${todayStr}-${String(nextQueueNum).padStart(3, '0')}`;
  const orderId = `ord-${Date.now()}`;

  const orderItems: OrderItem[] = payload.items.map((item, idx) => ({
    id: `item-${Date.now()}-${idx}`,
    order_id: orderId,
    menu_id: item.menu_id,
    category_type: (item.category_type || 'coffee') as CategoryType,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.subtotal,
    notes: item.notes || null,
    created_at: now.toISOString(),
    menu: {
      id: item.menu_id,
      category_id: 'c1111111-1111-1111-1111-111111111111',
      name: item.menu_name || 'Item',
      description: null,
      price: item.unit_price,
      image_url: null,
      is_available: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    }
  }));

  const newOrder: Order = {
    id: orderId,
    daily_queue_number: nextQueueNum,
    order_code: orderCode,
    customer_name: payload.customer_name,
    order_type: payload.order_type,
    order_source: payload.order_source,
    payment_method: payload.payment_method,
    payment_status: payload.payment_status,
    order_status: payload.order_status,
    total_amount,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    order_items: orderItems
  };

  setLocalOrders([newOrder, ...orders]);
  return newOrder;
}

export async function updateOrderStatus(
  orderId: string,
  updates: {
    payment_status?: 'pending' | 'paid' | 'cancelled';
    order_status?: 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  }
): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (!error) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gaskara_order_updated'));
        }
        return true;
      }
      console.error('Supabase updateOrderStatus error:', error);
    } catch (err) {
      console.error('Supabase updateOrderStatus exception:', err);
    }
  }

  const orders = getLocalOrders();
  const updated = orders.map((o) =>
    o.id === orderId ? { ...o, ...updates, updated_at: new Date().toISOString() } : o
  );
  setLocalOrders(updated);
  return true;
}

export async function getFinancialReports(): Promise<FinancialReport> {
  const orders = await fetchOrders();

  const validOrders = orders.filter(
    (o) => o.payment_status === 'paid' && o.order_status !== 'cancelled'
  );

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  let gross_sales_today = 0;
  let gross_sales_month = 0;

  const categoryAgg: Record<CategoryType, { sales: number; qty: number }> = {
    coffee: { sales: 0, qty: 0 },
    non_coffee: { sales: 0, qty: 0 },
    snack: { sales: 0, qty: 0 }
  };

  for (const order of validOrders) {
    const orderTime = new Date(order.created_at).getTime();
    if (orderTime >= todayStart) {
      gross_sales_today += order.total_amount;
    }
    if (orderTime >= monthStart) {
      gross_sales_month += order.total_amount;
    }

    if (order.order_items && Array.isArray(order.order_items)) {
      for (const item of order.order_items) {
        const cat = item.category_type;
        if (categoryAgg[cat]) {
          categoryAgg[cat].sales += item.subtotal;
          categoryAgg[cat].qty += item.quantity;
        }
      }
    }
  }

  return {
    gross_sales_today,
    gross_sales_month,
    total_transactions: validOrders.length,
    categories: [
      {
        category_type: 'coffee',
        title: 'Kopi',
        total_sales: categoryAgg.coffee.sales,
        total_quantity: categoryAgg.coffee.qty
      },
      {
        category_type: 'non_coffee',
        title: 'Non-Kopi',
        total_sales: categoryAgg.non_coffee.sales,
        total_quantity: categoryAgg.non_coffee.qty
      },
      {
        category_type: 'snack',
        title: 'Snack / Makanan',
        total_sales: categoryAgg.snack.sales,
        total_quantity: categoryAgg.snack.qty
      }
    ]
  };
}
