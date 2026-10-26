'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { fetchOrderByCode } from '@/lib/db-service';
import { Order } from '@/types/database';
import { CheckCircle2, Clock, AlertTriangle, ArrowLeft, RefreshCw, Sparkles, Coffee } from 'lucide-react';
import Link from 'next/link';

function OrderStatusContent() {
  const params = useParams();
  const orderCode = params?.order_code as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    if (!orderCode) return;
    try {
      const data = await fetchOrderByCode(orderCode);
      setOrder(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();

    const handleUpdate = () => {
      loadOrder();
    };

    window.addEventListener('gaskara_order_updated', handleUpdate);
    const interval = setInterval(loadOrder, 3000);

    return () => {
      window.removeEventListener('gaskara_order_updated', handleUpdate);
      clearInterval(interval);
    };
  }, [orderCode]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-400 text-xs font-medium">
        Memuat status antrian...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h1 className="text-base font-bold text-slate-900 mb-1">Pesanan Tidak Ditemukan</h1>
        <p className="text-slate-500 text-xs mb-4">
          Kode {orderCode} tidak terdaftar.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-slate-900 text-white font-medium text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Menu
        </Link>
      </div>
    );
  }

  const getStatusDisplay = () => {
    if (order.order_status === 'cancelled') {
      return {
        badge: 'Pesanan Dibatalkan',
        badgeColor: 'bg-red-50 text-red-600',
        title: 'Pesanan Dibatalkan',
        desc: 'Pesanan ini dibatalkan oleh kasir atau sistem.',
        icon: AlertTriangle,
        iconColor: 'text-red-500'
      };
    }

    if (order.payment_status === 'pending') {
      return {
        badge: 'Menunggu Pembayaran',
        badgeColor: 'bg-amber-50 text-amber-800',
        title: 'Menunggu Konfirmasi Kasir',
        desc:
          order.payment_method === 'cash'
            ? 'Tunjukkan nomor antrian Anda ke kasir untuk membayar uang tunai.'
            : 'Scan QRIS kafe. Kasir akan segera memverifikasi mutasi Anda.',
        icon: Clock,
        iconColor: 'text-amber-600'
      };
    }

    if (order.order_status === 'preparing') {
      return {
        badge: 'Sedang Dibuat',
        badgeColor: 'bg-cyan-50 text-cyan-800',
        title: 'Pesanan Sedang Diracik Barista',
        desc: 'Mohon tunggu sejenak, minuman & snack Anda sedang disiapkan.',
        icon: Coffee,
        iconColor: 'text-cyan-600'
      };
    }

    if (order.order_status === 'ready') {
      return {
        badge: 'Siap Diambil',
        badgeColor: 'bg-red-600 text-white',
        title: 'Pesanan Siap Diambil di Counter',
        desc: `Silakan ambil pesanan Anda di counter atas nama ${order.customer_name}.`,
        icon: Sparkles,
        iconColor: 'text-red-600'
      };
    }

    return {
      badge: 'Selesai',
      badgeColor: 'bg-slate-100 text-slate-700',
      title: 'Pesanan Telah Selesai',
      desc: 'Terima kasih telah berkunjung ke Gaskara Coffee!',
      icon: CheckCircle2,
      iconColor: 'text-cyan-600'
    };
  };

  const status = getStatusDisplay();
  const StatusIcon = status.icon;

  return (
    <div className="max-w-md mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-3">
        <Link
          href="/"
          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Pesan Lagi
        </Link>
        <button
          onClick={loadOrder}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 font-medium"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Kartu Nomor Antrian Flat */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center mb-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          {status.badge}
        </div>

        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
          Nomor Antrian
        </div>
        <div className="text-5xl font-bold text-slate-900 font-mono my-1">
          #{String(order.daily_queue_number).padStart(3, '0')}
        </div>
        <div className="text-sm font-semibold text-slate-800">{order.customer_name}</div>
        <div className="text-xs font-mono text-slate-400 mb-4">{order.order_code}</div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left flex items-start gap-2.5">
          <StatusIcon className={`w-4 h-4 ${status.iconColor} shrink-0 mt-0.5`} />
          <div>
            <div className="text-xs font-semibold text-slate-900">{status.title}</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{status.desc}</div>
          </div>
        </div>
      </div>

      {/* Rincian Pesanan Flat */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100 pb-1.5">
          Rincian Pesanan
        </h3>

        <div className="flex justify-between text-xs text-slate-600">
          <span>Penyajian</span>
          <span className="font-medium text-slate-900">
            {order.order_type === 'dine_in' ? 'Dine In' : 'Takeaway'}
          </span>
        </div>

        <div className="flex justify-between text-xs text-slate-600">
          <span>Metode Bayar</span>
          <span className="font-medium text-slate-900 uppercase">{order.payment_method}</span>
        </div>

        <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex justify-between text-xs text-slate-700">
              <div>
                <span>
                  {item.quantity}x {item.menu?.name || 'Item'}
                </span>
                {item.notes && (
                  <div className="text-[10px] text-slate-400 italic ml-3">{item.notes}</div>
                )}
              </div>
              <span className="font-medium text-slate-900">
                Rp {item.subtotal.toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-2 flex justify-between items-center">
          <span className="text-xs font-medium text-slate-600">Total</span>
          <span className="text-sm font-bold text-slate-900">
            Rp {order.total_amount.toLocaleString('id-ID')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function OrderStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center text-slate-400 text-xs font-medium">
          Memuat status...
        </div>
      }
    >
      <OrderStatusContent />
    </Suspense>
  );
}
