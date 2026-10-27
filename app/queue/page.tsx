'use client';

import { useState, useEffect } from 'react';
import { fetchOrders } from '@/lib/db-service';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Order } from '@/types/database';
import { Maximize2, Minimize2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function QueueDisplayPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [timeStr, setTimeStr] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'all' | 'ready' | 'preparing'>('all');

  const loadData = async () => {
    const list = await fetchOrders();
    setOrders(list);
  };

  useEffect(() => {
    loadData();

    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const clockTimer = setInterval(updateClock, 1000);

    let channel: ReturnType<typeof supabase.channel> | null = null;
    if (isSupabaseConfigured()) {
      channel = supabase
        .channel('public:orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            loadData();
          }
        )
        .subscribe();
    }

    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener('gaskara_order_updated', handleUpdate);
    const pollInterval = setInterval(loadData, 3000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(pollInterval);
      window.removeEventListener('gaskara_order_updated', handleUpdate);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const preparingOrders = orders.filter(
    (o) =>
      (o.order_status === 'preparing' || o.order_status === 'received') &&
      o.order_status !== 'ready' &&
      o.order_status !== 'completed' &&
      o.order_status !== 'cancelled'
  );

  const readyOrders = orders.filter((o) => o.order_status === 'ready');

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 text-slate-900 flex flex-col font-sans select-none overflow-hidden">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-3 sm:px-6 h-12 sm:h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Kembali ke Menu"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm">
            G
          </div>
          <div>
            <h1 className="text-xs sm:text-base font-bold tracking-tight text-slate-900 leading-none">
              GASKARA COFFEE
            </h1>
            <span className="text-[10px] text-slate-400">Antrian Pesanan</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="font-mono font-bold text-xs sm:text-base text-cyan-600">
            {timeStr}
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher (Hanya tampil di layar smartphone / mobile) */}
      <div className="sm:hidden bg-white border-b border-slate-200 px-2.5 py-1.5 flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => setMobileTab('all')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-colors text-center ${
            mobileTab === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setMobileTab('ready')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-colors text-center flex items-center justify-center gap-1 ${
            mobileTab === 'ready'
              ? 'bg-red-600 text-white'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          <span>Siap</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
            {readyOrders.length}
          </span>
        </button>
        <button
          onClick={() => setMobileTab('preparing')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-colors text-center flex items-center justify-center gap-1 ${
            mobileTab === 'preparing'
              ? 'bg-cyan-600 text-white'
              : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100'
          }`}
        >
          <span>Dibuat</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
            {preparingOrders.length}
          </span>
        </button>
      </div>

      {/* 2 Kolom Antrian: Sedang Dibuat & Siap Diambil */}
      <main className="flex-1 min-h-0 p-2 sm:p-4 overflow-hidden flex flex-col sm:grid sm:grid-cols-2 gap-2 sm:gap-4">
        {/* Kolom 1: Sedang Dibuat */}
        <section
          className={`bg-white border border-slate-200 rounded-2xl flex-col min-h-0 overflow-hidden ${
            mobileTab === 'ready' ? 'hidden sm:flex' : 'flex flex-1'
          }`}
        >
          <div className="bg-slate-100 px-3 sm:px-5 py-2 sm:py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">
              Sedang Dibuat
            </h2>
            <span className="text-xs sm:text-sm font-bold text-cyan-700 font-mono">
              {preparingOrders.length}
            </span>
          </div>

          <div className="flex-1 min-h-0 p-2 sm:p-3 overflow-y-auto">
            {preparingOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs py-8">
                Tidak ada pesanan dibuat
              </div>
            ) : (
              <div
                className={`grid gap-2 ${
                  mobileTab === 'preparing' ? 'grid-cols-2 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'
                }`}
              >
                {preparingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-2.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-center"
                  >
                    <div className="text-2xl sm:text-4xl font-bold text-slate-900 font-mono tracking-tight">
                      #{String(order.daily_queue_number).padStart(3, '0')}
                    </div>
                    <div className="text-[11px] sm:text-sm text-slate-600 truncate font-medium mt-0.5">
                      {order.customer_name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Kolom 2: Siap Diambil */}
        <section
          className={`bg-white border border-red-200 rounded-2xl flex-col min-h-0 overflow-hidden ${
            mobileTab === 'preparing' ? 'hidden sm:flex' : 'flex flex-1'
          }`}
        >
          <div className="bg-red-600 px-3 sm:px-5 py-2 sm:py-3 flex items-center justify-between shrink-0 text-white">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wide">
              Siap Diambil
            </h2>
            <span className="text-xs sm:text-sm font-bold font-mono">
              {readyOrders.length}
            </span>
          </div>

          <div className="flex-1 min-h-0 p-2 sm:p-3 overflow-y-auto">
            {readyOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs py-8">
                Semua pesanan sudah diambil
              </div>
            ) : (
              <div
                className={`grid gap-2 ${
                  mobileTab === 'ready' ? 'grid-cols-2 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'
                }`}
              >
                {readyOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-2.5 sm:p-4 rounded-xl bg-red-600 text-white flex flex-col justify-center shadow-sm"
                  >
                    <div className="text-2xl sm:text-4xl font-bold font-mono tracking-tight">
                      #{String(order.daily_queue_number).padStart(3, '0')}
                    </div>
                    <div className="text-[11px] sm:text-sm truncate font-semibold text-red-100 mt-0.5">
                      {order.customer_name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
