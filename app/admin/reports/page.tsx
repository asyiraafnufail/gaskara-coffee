'use client';

import { useState, useEffect } from 'react';
import { getFinancialReports, fetchOrders } from '@/lib/db-service';
import { FinancialReport, Order } from '@/types/database';
import { FileText, TrendingUp, Calendar, ShoppingBag, Coffee, Cookie, RefreshCw, CheckCircle } from 'lucide-react';

export default function AdminReportsPage() {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [repData, ordData] = await Promise.all([getFinancialReports(), fetchOrders()]);
      setReport(repData);
      setOrders(ordData.filter((o) => o.payment_status === 'paid' && o.order_status !== 'cancelled'));
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
    return () => {
      window.removeEventListener('gaskara_order_updated', handleUpdate);
    };
  }, []);

  const getCategoryIcon = (type: string) => {
    if (type === 'coffee') return Coffee;
    if (type === 'non_coffee') return ShoppingBag;
    return Cookie;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">
            <FileText className="w-3.5 h-3.5" /> Financial Reports
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Laporan Penjualan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekap omzet kotor harian dan bulanan dengan rincian kategori kopi, non-kopi, dan snack.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Menghitung rekap penjualan...</div>
      ) : !report ? (
        <div className="text-center py-20 text-slate-400 text-xs">Data belum tersedia.</div>
      ) : (
        <div className="space-y-5">
          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Metric 1: Omzet Hari Ini */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Omzet Hari Ini
                </span>
                <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                Rp {report.gross_sales_today.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Pesanan sukses terbayar hari ini
              </p>
            </div>

            {/* Metric 2: Omzet Bulan Ini */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Omzet Bulan Ini
                </span>
                <div className="p-2 rounded-xl bg-red-50 text-red-600">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                Rp {report.gross_sales_month.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Akumulasi transaksi bulan berjalan
              </p>
            </div>

            {/* Metric 3: Total Transaksi */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Total Transaksi
                </span>
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {report.total_transactions}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Pesanan terverifikasi dan sukses
              </p>
            </div>
          </div>

          {/* Rincian Kategori */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-xs font-bold text-slate-900 mb-3.5 uppercase tracking-wide">
              Rincian Omzet per Kategori
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {report.categories.map((cat) => {
                const Icon = getCategoryIcon(cat.category_type);
                const unitLabel = cat.category_type === 'snack' ? 'Porsi' : 'Cup';
                return (
                  <div
                    key={cat.category_type}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-cyan-700">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="font-semibold text-xs text-slate-800">{cat.title}</h3>
                      </div>

                      <div className="text-xl font-bold text-slate-900 mb-1">
                        Rp {cat.total_sales.toLocaleString('id-ID')}
                      </div>
                      <div className="text-xs text-slate-500">
                        Terjual: <span className="text-red-600 font-semibold">{cat.total_quantity}</span> {unitLabel}
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200 text-[10px] text-slate-400">
                      Rasio: {report.gross_sales_month > 0
                        ? ((cat.total_sales / report.gross_sales_month) * 100).toFixed(1)
                        : '0'}% dari total omzet
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabel Transaksi Terakhir */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-xs text-slate-800 uppercase tracking-wide">
                Transaksi Valid Terakhir
              </h3>
              <span className="text-xs text-slate-400">{orders.length} transaksi</span>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Belum ada transaksi valid yang tercatat.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Kode Order</th>
                      <th className="px-4 py-2.5">Pelanggan</th>
                      <th className="px-4 py-2.5">Tipe & Metode</th>
                      <th className="px-4 py-2.5">Waktu</th>
                      <th className="px-4 py-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {orders.slice(0, 10).map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-2.5 font-mono font-semibold text-cyan-600">
                          {o.order_code} (#{String(o.daily_queue_number).padStart(3, '0')})
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-slate-900">
                          {o.customer_name}
                        </td>
                        <td className="px-4 py-2.5 uppercase text-slate-500">
                          {o.order_type === 'dine_in' ? 'Dine In' : 'Takeaway'} • {o.payment_method}
                        </td>
                        <td className="px-4 py-2.5 text-slate-400">
                          {new Date(o.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                          Rp {o.total_amount.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
