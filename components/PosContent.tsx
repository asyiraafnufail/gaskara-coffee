'use client';

import { useState, useEffect } from 'react';
import { fetchMenus, fetchOrders, createOrder, updateOrderStatus } from '@/lib/db-service';
import { Menu, Order, CategoryType, OrderType, PaymentMethod } from '@/types/database';
import { Search, Plus, Minus, Trash2, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export default function PosContent() {
  const [activeTab, setActiveTab] = useState<'pos' | 'incoming' | 'queue'>('pos');
  const [menus, setMenus] = useState<Menu[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Cart state
  const [cart, setCart] = useState<
    {
      menu_id: string;
      name: string;
      price: number;
      quantity: number;
      category_type: CategoryType;
      notes: string;
    }[]
  >([]);
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [menuList, orderList] = await Promise.all([fetchMenus(), fetchOrders()]);
      setMenus(menuList);
      setOrders(orderList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('gaskara_order_updated', handleUpdate);
    window.addEventListener('gaskara_menu_updated', handleUpdate);

    const interval = setInterval(loadData, 4000);
    return () => {
      window.removeEventListener('gaskara_order_updated', handleUpdate);
      window.removeEventListener('gaskara_menu_updated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!orderSuccessMsg) return;
    const timer = setTimeout(() => {
      setOrderSuccessMsg(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [orderSuccessMsg]);

  const addToCart = (menu: Menu) => {
    if (!menu.is_available) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.menu_id === menu.id);
      if (existing) {
        return prev.map((item) =>
          item.menu_id === menu.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      const catType = (menu.category?.type || 'coffee') as CategoryType;
      return [
        ...prev,
        {
          menu_id: menu.id,
          name: menu.name,
          price: menu.price,
          quantity: 1,
          category_type: catType,
          notes: ''
        }
      ];
    });
  };

  const updateCartQty = (menuId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.menu_id === menuId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as typeof cart
    );
  };

  const updateCartNotes = (menuId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) => (item.menu_id === menuId ? { ...item, notes } : item))
    );
  };

  const removeFromCart = (menuId: string) => {
    setCart((prev) => prev.filter((item) => item.menu_id !== menuId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cashNum = parseFloat(cashGiven) || 0;
  const changeAmount = cashNum - cartTotal;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Nama pelanggan wajib diisi!');
      return;
    }
    if (cart.length === 0) {
      alert('Keranjang masih kosong!');
      return;
    }
    if (paymentMethod === 'cash' && cashNum < cartTotal) {
      alert('Jumlah uang tunai kurang dari total bayar!');
      return;
    }

    setSubmitting(true);
    try {
      const newOrder = await createOrder({
        customer_name: customerName.trim(),
        order_type: orderType,
        order_source: 'pos',
        payment_method: paymentMethod,
        payment_status: 'paid',
        order_status: 'preparing',
        items: cart.map((i) => ({
          menu_id: i.menu_id,
          category_type: i.category_type,
          quantity: i.quantity,
          unit_price: i.price,
          subtotal: i.price * i.quantity,
          notes: i.notes,
          menu_name: i.name
        }))
      });

      setOrderSuccessMsg(
        `Pesanan ${newOrder.order_code} (#${newOrder.daily_queue_number}) berhasil dibuat! Kembalian: Rp ${(
          paymentMethod === 'cash' ? Math.max(0, changeAmount) : 0
        ).toLocaleString('id-ID')}`
      );
      setCart([]);
      setCustomerName('');
      setCashGiven('');
      await loadData();
    } catch (err: unknown) {
      console.error('POS Checkout error:', err);
      alert((err as Error).message || 'Gagal membuat pesanan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmWebOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, {
      payment_status: 'paid',
      order_status: 'preparing'
    });
    await loadData();
  };

  const handleCancelOrder = async (orderId: string) => {
    if (confirm('Batalkan pesanan ini?')) {
      await updateOrderStatus(orderId, {
        order_status: 'cancelled',
        payment_status: 'cancelled'
      });
      await loadData();
    }
  };

  const handleAdvanceQueue = async (orderId: string, nextStatus: 'ready' | 'completed') => {
    await updateOrderStatus(orderId, { order_status: nextStatus });
    await loadData();
  };

  const CATEGORY_ORDER: Record<string, number> = {
    coffee: 1,
    non_coffee: 2,
    snack: 3
  };

  const getMenuCategory = (menu: Menu): CategoryType => {
    if (menu.category?.type) return menu.category.type;
    if (menu.category_id === 'c1111111-1111-1111-1111-111111111111') return 'coffee';
    if (menu.category_id === 'c2222222-2222-2222-2222-222222222222') return 'non_coffee';
    if (menu.category_id === 'c3333333-3333-3333-3333-333333333333') return 'snack';
    return 'coffee';
  };

  const filteredMenus = menus
    .filter((menu) => {
      const catType = getMenuCategory(menu);
      const matchesCat =
        selectedCategory === 'all' || catType === selectedCategory;
      const matchesSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      const typeA = getMenuCategory(a);
      const typeB = getMenuCategory(b);
      const rankA = CATEGORY_ORDER[typeA] ?? 99;
      const rankB = CATEGORY_ORDER[typeB] ?? 99;
      if (rankA !== rankB) return rankA - rankB;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  const pendingWebOrders = orders.filter(
    (o) => o.order_source === 'web' && o.payment_status === 'pending' && o.order_status !== 'cancelled'
  );

  const activeQueueOrders = orders.filter(
    (o) =>
      o.payment_status === 'paid' &&
      (o.order_status === 'preparing' || o.order_status === 'ready')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 lg:h-[calc(100vh-3.5rem)] lg:flex lg:flex-col lg:overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2.5 mb-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-1.5 rounded-full font-semibold text-xs transition-colors ${
              activeTab === 'pos'
                ? 'bg-red-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Kasir Input
          </button>
          <button
            onClick={() => setActiveTab('incoming')}
            className={`relative px-4 py-1.5 rounded-full font-semibold text-xs transition-colors ${
              activeTab === 'incoming'
                ? 'bg-red-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Order Masuk Web
            {pendingWebOrders.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-100 text-cyan-800">
                {pendingWebOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-1.5 rounded-full font-semibold text-xs transition-colors ${
              activeTab === 'queue'
                ? 'bg-red-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Status Antrian ({activeQueueOrders.length})
          </button>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Floating Pop-up Toast Notifikasi Sukses */}
      {orderSuccessMsg && (
        <div className="fixed top-14 right-4 sm:right-6 z-50 max-w-sm w-full bg-white border border-cyan-300 shadow-xl rounded-2xl p-3.5 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-slate-900 text-xs">Pesanan Berhasil!</div>
            <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{orderSuccessMsg}</p>
          </div>
          <button
            onClick={() => setOrderSuccessMsg(null)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg shrink-0"
            title="Tutup Notifikasi"
          >
            ✕
          </button>
        </div>
      )}

      {/* View 1: POS Input Kasir */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 lg:overflow-hidden">
          {/* Menu Catalog - TEXT ONLY, NO IMAGES AS PER PRD */}
          <div className="lg:col-span-7 flex flex-col gap-3 min-h-0 lg:overflow-hidden">
            {/* Search & Categories Bar - Sticky/Fixed at top of catalog */}
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto shrink-0">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'coffee', label: 'Coffee' },
                  { id: 'non_coffee', label: 'Non-Coffee' },
                  { id: 'snack', label: 'Snack' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Menu Items Grid */}
            <div className="flex-1 min-h-0 lg:overflow-y-auto pr-1">
              {loading ? (
                <div className="p-10 text-center text-slate-400 text-xs">Memuat katalog...</div>
              ) : filteredMenus.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
                  Menu tidak ditemukan
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-2">
                  {filteredMenus.map((menu) => (
                    <button
                      key={menu.id}
                      disabled={!menu.is_available}
                      onClick={() => addToCart(menu)}
                      className={`p-3 rounded-xl border text-left transition-colors flex flex-col justify-between min-h-[84px] bg-white ${
                        !menu.is_available
                          ? 'opacity-40 border-slate-200 cursor-not-allowed bg-slate-50'
                          : 'border-slate-200 hover:border-cyan-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-semibold text-xs text-slate-900 leading-snug">
                            {menu.name}
                          </span>
                          {!menu.is_available && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                              Habis
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          {menu.category?.name || 'Item'}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-xs mt-2">
                        Rp {menu.price.toLocaleString('id-ID')}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart & Checkout Panel - FIXED/STATIC TO SCREEN HEIGHT */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col min-h-0 lg:h-full lg:overflow-hidden">
            {/* Header Cart */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                  Pesanan Aktif
                </h3>
                {cart.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800">
                    {cart.reduce((sum, i) => sum + i.quantity, 0)} item
                  </span>
                )}
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Hapus Semua
                </button>
              )}
            </div>

            {/* Cart Items List - Fills full available height dynamically, no blank gap */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 space-y-1.5 py-0.5 mb-2.5">
              {cart.length === 0 ? (
                <div className="h-full min-h-[80px] flex items-center justify-center text-center text-slate-400 text-xs">
                  Klik menu di sebelah kiri untuk menambah pesanan.
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.menu_id}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 leading-none">
                      <span className="font-semibold text-slate-900 truncate">{item.name}</span>
                      <span className="font-bold text-slate-900 shrink-0 font-mono">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 leading-none">
                      <input
                        type="text"
                        placeholder="Catatan item..."
                        value={item.notes}
                        onChange={(e) => updateCartNotes(item.menu_id, e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-[11px] text-slate-800 flex-1 min-w-0 focus:outline-none focus:border-cyan-400"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => updateCartQty(item.menu_id, -1)}
                          className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-slate-900 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.menu_id, 1)}
                          className="w-5 h-5 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.menu_id)}
                          className="w-5 h-5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center ml-0.5 transition-colors"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Form Checkout - STATIC / LOCKED AT THE BOTTOM */}
            <form onSubmit={handleCheckout} className="space-y-2.5 border-t border-slate-100 pt-2.5 shrink-0">
              {/* Box Nama Pelanggan & Tipe Pesanan Berdampingan */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama Pelanggan <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Penyajian <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setOrderType('dine_in')}
                      className={`py-1.5 text-xs font-semibold rounded-xl border text-center transition-colors ${
                        orderType === 'dine_in'
                          ? 'bg-cyan-600 text-white border-cyan-600'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Dine-in
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('takeaway')}
                      className={`py-1.5 text-xs font-semibold rounded-xl border text-center transition-colors ${
                        orderType === 'takeaway'
                          ? 'bg-cyan-600 text-white border-cyan-600'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Takeaway
                    </button>
                  </div>
                </div>
              </div>

              {/* Metode Pembayaran */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-1.5 text-xs font-semibold rounded-xl border text-center transition-colors ${
                      paymentMethod === 'cash'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Tunai (Cash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`py-1.5 text-xs font-semibold rounded-xl border text-center transition-colors ${
                      paymentMethod === 'qris'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    QRIS Statis
                  </button>
                </div>

                {paymentMethod === 'cash' && (
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-600 font-medium">Uang Diterima:</span>
                      <input
                        type="number"
                        placeholder="Rp..."
                        value={cashGiven}
                        onChange={(e) => setCashGiven(e.target.value)}
                        className="w-28 bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-xs text-right text-slate-900 font-bold focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="flex gap-1 justify-end">
                      {[20000, 50000, 100000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCashGiven(amt.toString())}
                          className="px-2 py-0.5 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-[10px] text-slate-700 font-medium"
                        >
                          {(amt / 1000).toFixed(0)}k
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setCashGiven(cartTotal.toString())}
                        className="px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[10px] font-semibold"
                      >
                        Pas
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                      <span className="text-slate-600">Kembalian:</span>
                      <span
                        className={`font-bold ${
                          changeAmount >= 0 ? 'text-cyan-700' : 'text-red-600'
                        }`}
                      >
                        Rp {Math.max(0, changeAmount).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Total & Tombol Aksi */}
              <div className="border-t border-slate-100 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                  <span>Total Tagihan</span>
                  <span className="text-base text-slate-900 font-bold font-mono">
                    Rp {cartTotal.toLocaleString('id-ID')}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={cart.length === 0 || submitting}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs transition-colors"
                >
                  {submitting ? 'Memproses...' : 'Proses & Masuk Antrian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View 2: Feed Pesanan Masuk Web */}
      {activeTab === 'incoming' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
              Pesanan Masuk Web ({pendingWebOrders.length})
            </h3>
            <span className="text-xs text-slate-400">Status pending</span>
          </div>

          {pendingWebOrders.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
              Tidak ada pesanan web yang menunggu konfirmasi.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendingWebOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5 border-b border-slate-100 pb-2">
                      <div>
                        <span className="text-xl font-bold text-slate-900 font-mono">
                          #{String(order.daily_queue_number).padStart(3, '0')}
                        </span>
                        <div className="text-[11px] text-slate-400">{order.order_code}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                        {order.order_type === 'dine_in' ? 'Dine In' : 'Takeaway'}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 mb-2">
                      {order.customer_name}
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 space-y-1 mb-3 text-xs">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex justify-between text-slate-700">
                          <span>
                            {item.quantity}x {item.menu?.name || 'Menu'}
                            {item.notes ? ` (${item.notes})` : ''}
                          </span>
                          <span className="font-medium">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                      <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900">
                        <span>Total ({order.payment_method.toUpperCase()}):</span>
                        <span className="text-red-600">
                          Rp {order.total_amount.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-white hover:bg-slate-50 text-red-600 border border-slate-200 text-xs font-medium"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Batalkan</span>
                    </button>
                    <button
                      onClick={() => handleConfirmWebOrder(order.id)}
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Konfirmasi</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View 3: Status Alur Antrian */}
      {activeTab === 'queue' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
              Antrian Dapur ({activeQueueOrders.length})
            </h3>
            <span className="text-xs text-slate-400">
              Sedang Dibuat → Siap Diambil → Selesai
            </span>
          </div>

          {activeQueueOrders.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
              Tidak ada antrian aktif saat ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeQueueOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5 border-b border-slate-100 pb-2">
                      <div>
                        <span className="text-xl font-bold text-slate-900 font-mono">
                          #{String(order.daily_queue_number).padStart(3, '0')}
                        </span>
                        <div className="text-xs font-medium text-slate-600">{order.customer_name}</div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          order.order_status === 'preparing'
                            ? 'bg-cyan-50 text-cyan-800'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {order.order_status === 'preparing' ? 'Sedang Dibuat' : 'Siap Diambil'}
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 space-y-1 mb-3 text-xs text-slate-700">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <span>
                            {item.quantity}x {item.menu?.name || 'Menu'}
                          </span>
                          {item.notes && (
                            <span className="text-[11px] text-slate-400 italic ml-2">
                              {item.notes}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    {order.order_status === 'preparing' ? (
                      <button
                        onClick={() => handleAdvanceQueue(order.id, 'ready')}
                        className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tandai Siap Diambil</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAdvanceQueue(order.id, 'completed')}
                        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Selesaikan Pesanan</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
