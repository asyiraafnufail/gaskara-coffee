'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Coffee,
  LayoutDashboard,
  FileText,
  Monitor,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Layers
} from 'lucide-react';
import { getFinancialReports, fetchOrders, fetchMenus } from '@/lib/db-service';
import { FinancialReport, Order, Menu } from '@/types/database';

export default function AdminHomePage() {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [repData, ordData, menuData] = await Promise.all([
        getFinancialReports(),
        fetchOrders(),
        fetchMenus()
      ]);
      setReport(repData);
      setOrders(ordData);
      setMenus(menuData);
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

    return () => {
      window.removeEventListener('gaskara_order_updated', handleUpdate);
      window.removeEventListener('gaskara_menu_updated', handleUpdate);
    };
  }, []);

  const pendingWebOrders = orders.filter(
    (o) => o.order_source === 'web' && o.payment_status === 'pending' && o.order_status !== 'cancelled'
  );

  const availableMenusCount = menus.filter((m) => m.is_available).length;

  const adminModules = [
    {
      href: '/admin/pos',
      title: 'POS Kasir',
      subtitle: 'Operasional Kasir',
      desc: 'Antarmuka kasir cepat berbasis teks. Catat pesanan dine-in & takeaway, kalkulator pecahan tunai, dan konfirmasi order masuk web.',
      icon: Coffee,
      iconColor: 'text-red-600',
      badgeColor: 'bg-red-50 text-red-700',
      actionText: 'Buka POS Kasir',
      notification: pendingWebOrders.length > 0 ? `${pendingWebOrders.length} order web menunggu` : null
    },
    {
      href: '/admin/menu',
      title: 'Kelola Menu & Stok',
      subtitle: 'Katalog Produk',
      desc: 'Sakelar ketersediaan cepat instan tanpa stok opname ribet. Tambah menu baru, sesuaikan harga, gambar, atau hapus item.',
      icon: LayoutDashboard,
      iconColor: 'text-cyan-600',
      badgeColor: 'bg-cyan-50 text-cyan-800',
      actionText: 'Kelola Menu',
      meta: `${availableMenusCount} dari ${menus.length} menu aktif`
    },
    {
      href: '/admin/reports',
      title: 'Laporan Penjualan',
      subtitle: 'Keuangan & Omzet',
      desc: 'Rekapitulasi omzet kotor harian dan bulanan dengan rincian volume penjualan per kategori kopi, non-kopi, dan snack.',
      icon: FileText,
      iconColor: 'text-slate-700',
      badgeColor: 'bg-slate-100 text-slate-800',
      actionText: 'Lihat Laporan',
      meta: report ? `Rp ${report.gross_sales_today.toLocaleString('id-ID')} hari ini` : undefined
    },
    {
      href: '/queue',
      title: 'Display Antrian TV',
      subtitle: 'Layar Counter',
      desc: 'Layar monitor TV antrian pengunjung mode fullscreen otomatis dengan kolom Sedang Dibuat dan Siap Diambil.',
      icon: Monitor,
      iconColor: 'text-cyan-600',
      badgeColor: 'bg-cyan-50 text-cyan-800',
      actionText: 'Buka Display TV',
      meta: 'Fullscreen TV Monitor'
    },
    {
      href: '/',
      title: 'Web Pemesanan Customer',
      subtitle: 'Portal Pelanggan',
      desc: 'Tampilan mobile customer untuk self-order mandiri tanpa nomor meja, pilihan penyajian, dan verifikasi QRIS statis.',
      icon: ShoppingBag,
      iconColor: 'text-red-600',
      badgeColor: 'bg-red-50 text-red-700',
      actionText: 'Pratinjau Web',
      meta: 'Mobile Self-Order'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header Selamat Datang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">
            <Layers className="w-3.5 h-3.5" /> Pusat Kendali Kafe
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Pengelola
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih modul kerja untuk melayani pelanggan, memantau antrian, atau mengelola katalog.
          </p>
        </div>

        {/* Ringkasan Cepat */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
            <span className="text-xs text-slate-500 font-medium">Omzet Hari Ini:</span>
          </div>
          <span className="text-sm font-bold text-slate-900 font-mono">
            Rp {(report?.gross_sales_today || 0).toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Grid Box Pilihan Modul Admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {adminModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.href}
              href={mod.href}
              className="group bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 flex flex-col justify-between transition-colors"
            >
              <div>
                {/* Header Kartu: Icon & Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${mod.badgeColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${mod.iconColor}`} />
                  </div>

                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${mod.badgeColor}`}>
                    {mod.subtitle}
                  </span>
                </div>

                {/* Konten Teks */}
                <h2 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                  {mod.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {mod.desc}
                </p>
              </div>

              {/* Footer Kartu: Notifikasi / Meta & Action */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                {mod.notification ? (
                  <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                    {mod.notification}
                  </span>
                ) : mod.meta ? (
                  <span className="text-[11px] text-slate-400 font-medium">
                    {mod.meta}
                  </span>
                ) : (
                  <span></span>
                )}

                <span className="font-semibold text-slate-900 group-hover:text-red-600 inline-flex items-center gap-1 transition-colors">
                  <span>{mod.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
