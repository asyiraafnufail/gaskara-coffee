'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee, Monitor, ShoppingBag, LayoutDashboard, FileText, ArrowLeft } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  // Queue display is standalone fullscreen
  if (pathname === '/queue') return null;

  const isCustomerPage = pathname === '/' || pathname.startsWith('/order');
  const isLoginPage = pathname === '/login' || pathname === '/admin/login';

  if (isCustomerPage) {
    return (
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xs">
              G
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">
              Gaskara<span className="text-cyan-500">.</span>
            </span>
          </Link>

          <Link
            href="/queue"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
          >
            <Monitor className="w-3.5 h-3.5 text-cyan-600" />
            <span>Antrian</span>
          </Link>
        </div>
      </header>
    );
  }

  if (isLoginPage) {
    return (
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xs">
              G
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">
              Gaskara<span className="text-cyan-500">.</span>
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full bg-slate-100"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Menu Customer</span>
          </Link>
        </div>
      </header>
    );
  }

  // Staff & Admin Navbar (/admin/*)
  const adminLinks = [
    { href: '/admin/pos', label: 'POS Kasir', icon: Coffee },
    { href: '/admin/menu', label: 'Kelola Menu', icon: LayoutDashboard },
    { href: '/admin/reports', label: 'Laporan Keuangan', icon: FileText },
    { href: '/queue', label: 'Display Antrian', icon: Monitor },
    { href: '/', label: 'Web Customer', icon: ShoppingBag }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/admin/pos" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xs">
              G
            </div>
            <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900">
              Gaskara <span className="text-cyan-500">Admin</span>
            </span>
          </Link>

          <nav className="flex items-center space-x-1 overflow-x-auto py-2">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
