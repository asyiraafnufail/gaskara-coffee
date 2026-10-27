'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMenus, createOrder, fetchOrders } from '@/lib/db-service';
import { Menu, CategoryType, OrderType, PaymentMethod, Order } from '@/types/database';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  Coffee,
  AlertCircle,
  QrCode,
  Banknote,
  Clock,
  ArrowRight,
  FileEdit,
  Monitor,
  Search
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerOrderView() {
  const router = useRouter();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastOrderCode, setLastOrderCode] = useState<string | null>(null);
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
  const [inputOrderCode, setInputOrderCode] = useState('');

  // Cart state
  const [cart, setCart] = useState<
    {
      menu_id: string;
      name: string;
      price: number;
      quantity: number;
      category_type: CategoryType;
      notes: string;
      image_url: string | null;
    }[]
  >([]);

  // Checkout bottom sheet
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [editingNotesMenuId, setEditingNotesMenuId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [menuData, orderData] = await Promise.all([fetchMenus(), fetchOrders()]);
      setMenus(menuData);
      setActiveOrders(orderData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const storedLastOrder = localStorage.getItem('gaskara_last_order');
    if (storedLastOrder) {
      setLastOrderCode(storedLastOrder);
    }

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('gaskara_order_updated', handleUpdate);
    const interval = setInterval(loadData, 4000);

    return () => {
      window.removeEventListener('gaskara_order_updated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const CATEGORY_ORDER: Record<string, number> = {
    coffee: 1,
    non_coffee: 2,
    snack: 3
  };

  const getMenuCategory = (m: Menu): CategoryType => {
    if (m.category?.type) return m.category.type;
    if (m.category_id === 'c1111111-1111-1111-1111-111111111111') return 'coffee';
    if (m.category_id === 'c2222222-2222-2222-2222-222222222222') return 'non_coffee';
    if (m.category_id === 'c3333333-3333-3333-3333-333333333333') return 'snack';
    return 'coffee';
  };

  const addToCart = (menu: Menu) => {
    if (!menu.is_available) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.menu_id === menu.id);
      if (existing) {
        return prev.map((i) =>
          i.menu_id === menu.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          menu_id: menu.id,
          name: menu.name,
          price: menu.price,
          quantity: 1,
          category_type: getMenuCategory(menu),
          notes: '',
          image_url: menu.image_url
        }
      ];
    });
  };

  const updateQuantity = (menu_id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.menu_id === menu_id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as typeof cart
    );
  };

  const updateNotes = (menu_id: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) => (item.menu_id === menu_id ? { ...item, notes } : item))
    );
  };

  const getCartItem = (menuId: string) => {
    return cart.find((i) => i.menu_id === menuId);
  };

  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const filteredMenus = menus
    .filter((m) => {
      const catType = getMenuCategory(m);
      const matchCategory = activeCategory === 'all' || catType === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      const typeA = getMenuCategory(a);
      const typeB = getMenuCategory(b);
      const rankA = CATEGORY_ORDER[typeA] ?? 99;
      const rankB = CATEGORY_ORDER[typeB] ?? 99;
      if (rankA !== rankB) return rankA - rankB;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || cart.length === 0) return;

    setSubmitting(true);
    try {
      const items = cart.map((c) => ({
        menu_id: c.menu_id,
        category_type: c.category_type,
        quantity: c.quantity,
        unit_price: c.price,
        subtotal: c.price * c.quantity,
        notes: c.notes.trim() || undefined
      }));

      const newOrder = await createOrder({
        customer_name: customerName.trim(),
        order_type: orderType,
        order_source: 'web',
        payment_method: paymentMethod,
        payment_status: 'pending',
        order_status: 'received',
        items
      });

      localStorage.setItem('gaskara_last_order', newOrder.order_code);
      setCart([]);
      setIsCheckoutOpen(false);
      router.push(`/order/status/${newOrder.order_code}`);
    } catch (err: unknown) {
      alert((err as Error).message || 'Gagal memproses pesanan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <div className="max-w-md mx-auto w-full min-h-screen bg-white border-x border-slate-200 flex flex-col justify-between">
        <div>
          {/* Header Branding */}
          <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xs">
                G
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900">
                Gaskara<span className="text-cyan-500">.</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href="/queue"
                className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-full transition-colors"
              >
                <Monitor className="w-3.5 h-3.5 text-cyan-600" />
                <span>Antrian</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (lastOrderCode) {
                    router.push(`/order/status/${lastOrderCode}`);
                  } else {
                    setIsLookupModalOpen(true);
                  }
                }}
                className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-full transition-colors relative"
              >
                <Clock className="w-3.5 h-3.5 text-cyan-600" />
                <span>Pesanan Saya</span>
                {lastOrderCode && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 absolute -top-0.5 -right-0.5"></span>
                )}
              </button>

              {totalItemCount > 0 && (
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-red-600 text-white font-bold text-xs shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{totalItemCount}</span>
                </button>
              )}
            </div>
          </header>

          {/* Search Box Simetris */}
          <div className="px-4 pt-3 pb-2 bg-white border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kopi, matcha, croissant..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Sticky Kategori Filter */}
          <div className="sticky top-14 z-20 bg-white px-4 py-2 border-b border-slate-200">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'coffee', label: 'Coffee' },
                { id: 'non_coffee', label: 'Non-Coffee' },
                { id: 'snack', label: 'Snack' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Daftar Menu Grid/List */}
          <div className={`px-4 py-3 space-y-3 ${cart.length > 0 ? 'pb-24' : 'pb-4'}`}>
            {loading ? (
              <div className="text-center py-20 text-slate-400 text-xs font-medium">Memuat menu...</div>
            ) : filteredMenus.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Coffee className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-1" />
                <p className="text-xs font-semibold text-slate-700">
                  {searchQuery ? `Menu "${searchQuery}" tidak ditemukan` : 'Menu kategori ini kosong'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                    className="mt-2 text-xs font-semibold text-cyan-600 hover:underline"
                  >
                    Reset pencarian
                  </button>
                )}
              </div>
            ) : (
              filteredMenus.map((menu) => {
                const cartItem = getCartItem(menu.id);
                const qtyInCart = cartItem ? cartItem.quantity : 0;
                const isInCart = qtyInCart > 0;
                const hasNotes = !!cartItem?.notes;

                return (
                  <div
                    key={menu.id}
                    className={`p-3 rounded-2xl border transition-colors bg-white ${
                      !menu.is_available
                        ? 'border-slate-200 opacity-50'
                        : isInCart
                        ? 'border-cyan-400 bg-cyan-50/10'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      {/* Foto Menu — Rasio 1:1 Persegi Presisi 96x96px */}
                      <div className="relative w-24 h-24 aspect-square rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        {menu.image_url ? (
                          <img
                            src={menu.image_url}
                            alt={menu.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Coffee className="w-7 h-7" />
                          </div>
                        )}

                        {!menu.is_available && (
                          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-red-600">
                              Habis
                            </span>
                          </div>
                        )}

                        {isInCart && (
                          <div className="absolute top-1 left-1">
                            <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                              {qtyInCart}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info Menu — Tinggi h-24 Presisi Sejajar Atas & Bawah dengan Foto */}
                      <div className="flex-1 min-w-0 h-24 flex flex-col justify-between py-0">
                        <div>
                          <h3 className="font-semibold text-sm text-slate-900 truncate leading-snug">
                            {menu.name}
                          </h3>
                          {menu.description ? (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-0.5">
                              {menu.description}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex items-center justify-between h-7">
                          <span className="font-bold text-slate-900 text-xs">
                            Rp {menu.price.toLocaleString('id-ID')}
                          </span>

                          {!menu.is_available ? (
                            <span className="h-7 px-3 rounded-full bg-slate-100 text-slate-400 font-semibold text-xs flex items-center">
                              Habis
                            </span>
                          ) : isInCart ? (
                            <div className="h-7 flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-1.5">
                              <button
                                type="button"
                                onClick={() => updateQuantity(menu.id, -1)}
                                className="w-5 h-5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                                aria-label="Kurangi"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="w-4 text-center font-bold text-xs text-slate-900">
                                {qtyInCart}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(menu.id, 1)}
                                className="w-5 h-5 rounded-full bg-cyan-600 hover:bg-cyan-700 flex items-center justify-center text-white transition-colors"
                                aria-label="Tambah"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addToCart(menu)}
                              className="h-7 px-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Tambah</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {isInCart && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        {editingNotesMenuId === menu.id ? (
                          <div className="w-full flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="Catatan pesanan..."
                              value={cartItem?.notes || ''}
                              onChange={(e) => updateNotes(menu.id, e.target.value)}
                              className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => setEditingNotesMenuId(null)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 text-white text-xs font-medium"
                            >
                              OK
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingNotesMenuId(menu.id)}
                            className="flex items-center gap-1 text-[11px] text-cyan-600 hover:text-cyan-800 font-medium"
                          >
                            <FileEdit className="w-3 h-3 text-cyan-500" />
                            <span>
                              {hasNotes ? `Catatan: "${cartItem?.notes}"` : '+ Catatan'}
                            </span>
                          </button>
                        )}

                        <span className="text-xs text-slate-900 shrink-0 font-bold">
                          Rp {(menu.price * qtyInCart).toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Rapi Tanpa Area Kopong */}
        <footer className="px-4 py-6 border-t border-slate-100 bg-slate-50/60 text-center mt-auto">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            <span>Gaskara Coffee</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Self-pickup counter • Tanpa antri kasir
          </p>
        </footer>

        {/* Bottom Bar Floating Checkout */}
        {cart.length > 0 && !isCheckoutOpen && (
          <div className="fixed bottom-3 left-0 right-0 z-30 px-3 flex justify-center">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                className="flex items-center gap-2 text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold text-xs relative shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">
                    {totalItemCount} item
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Drawer Checkout Bottom Sheet */}
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-end justify-center">
            <div className="w-full max-w-md bg-white border-t border-slate-200 rounded-t-3xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-cyan-600" /> Ringkasan Pesanan
                  </h2>
                  <span className="text-[11px] text-slate-500">
                    {totalItemCount} item • Rp {totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-4 flex-1">
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.menu_id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <div className="text-slate-900 text-xs font-bold">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.menu_id, -1)}
                            className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-700"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-4 text-center font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.menu_id, 1)}
                            className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.menu_id, -item.quantity)}
                            className="w-5 h-5 rounded-full bg-red-50 text-red-600 flex items-center justify-center ml-1"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Catatan..."
                        value={item.notes}
                        onChange={(e) => updateNotes(item.menu_id, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  ))}
                </div>

                <form id="checkout-form" onSubmit={handleCreateOrder} className="space-y-3.5 border-t border-slate-200 pt-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Pemesan <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama Anda"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tipe Penyajian <span className="text-red-600">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOrderType('dine_in')}
                        className={`py-2 text-xs font-semibold rounded-xl border text-center transition-colors ${
                          orderType === 'dine_in'
                            ? 'bg-cyan-600 text-white border-cyan-600'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Dine-in (Gelas)
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType('takeaway')}
                        className={`py-2 text-xs font-semibold rounded-xl border text-center transition-colors ${
                          orderType === 'takeaway'
                            ? 'bg-cyan-600 text-white border-cyan-600'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Takeaway (Cup)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Metode Pembayaran
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('qris')}
                        className={`py-2 text-xs font-semibold rounded-xl border text-center flex items-center justify-center gap-1.5 transition-colors ${
                          paymentMethod === 'qris'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>QRIS Statis</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`py-2 text-xs font-semibold rounded-xl border text-center flex items-center justify-center gap-1.5 transition-colors ${
                          paymentMethod === 'cash'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>Tunai Kasir</span>
                      </button>
                    </div>

                    {paymentMethod === 'qris' ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-center space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-800 block">
                          Scan QRIS Statis Kafe
                        </span>
                        <div className="inline-block p-1 bg-white border border-slate-200 rounded-xl">
                          <div className="w-20 h-20 bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white">
                            <QrCode className="w-10 h-10 text-cyan-400" />
                            <span className="text-[7px] font-mono text-slate-300">GASKARA QRIS</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Scan via BCA, GoPay, OVO, Dana dll. Kasir memverifikasi setelah pesanan dibuat.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-700">
                        <AlertCircle className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-slate-600">
                          Tunjukkan nomor antrian Anda ke kasir untuk membayar dengan uang tunai.
                        </p>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              <div className="p-4 border-t border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-2 text-xs font-semibold">
                  <span className="text-slate-600">Total Tagihan</span>
                  <span className="text-sm text-slate-900 font-bold">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting || !customerName.trim()}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs transition-colors"
                >
                  {submitting ? 'Memproses...' : 'Pesan & Dapatkan Antrian'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Cek Pesanan Saya */}
        {isLookupModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-sm w-full shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-600" />
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                    Pesanan Saya
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLookupModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-3 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Belum ada pesanan aktif tersimpan di perangkat ini. Masukkan kode pesanan untuk melihat status:
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inputOrderCode.trim()) {
                      router.push(`/order/status/${inputOrderCode.trim().toUpperCase()}`);
                    }
                  }}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    required
                    placeholder="Contoh: GSK-20261027-001"
                    value={inputOrderCode}
                    onChange={(e) => setInputOrderCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors"
                  >
                    Lihat Status Pesanan
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
