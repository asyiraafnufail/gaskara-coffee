'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FileText, LogOut, ShieldCheck, Lock, Coffee, User, ArrowRight, AlertCircle, Monitor, ShoppingBag, Layers } from 'lucide-react';

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Form login inline state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const checkAuth = () => {
    if (typeof window === 'undefined') return;
    const session = sessionStorage.getItem('gaskara_admin_session_auth');
    setIsAuthenticated(session === 'authenticated');
  };

  useEffect(() => {
    localStorage.removeItem('gaskara_admin_auth');
    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('gaskara_admin_auth_changed', handleAuthChange);
    return () => {
      window.removeEventListener('gaskara_admin_auth_changed', handleAuthChange);
    };
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    const u = username.trim().toLowerCase();
    const p = password.trim();

    // Validasi login admin: admin/admin atau PIN 1234
    if ((u === 'admin' && p === 'admin') || p === '1234' || (u === 'admin' && p === 'gaskara123')) {
      sessionStorage.setItem('gaskara_admin_session_auth', 'authenticated');
      setIsAuthenticated(true);
      setErrorMsg('');
      setSubmitting(false);
      window.dispatchEvent(new CustomEvent('gaskara_admin_auth_changed'));
    } else {
      setErrorMsg('Username atau password salah! (admin / admin atau PIN 1234)');
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('gaskara_admin_session_auth');
    localStorage.removeItem('gaskara_admin_auth');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    window.dispatchEvent(new CustomEvent('gaskara_admin_auth_changed'));
  };

  // If on explicit /admin/login page, render directly
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div>
      {/* Jika belum terautentikasi (atau loading awal client-side) */}
      {!isAuthenticated ? (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-600 text-white font-black text-xl mb-3">
                G
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Gaskara <span className="text-cyan-500">Admin</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Area khusus pengelola kafe. Masukkan akun untuk membuka.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                <ShieldCheck className="w-4 h-4 text-cyan-600" />
                <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
                  Login Diperlukan
                </span>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password / PIN
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="admin atau 1234"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-200 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
                >
                  <span>{submitting ? 'Memeriksa...' : 'Buka Dashboard'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
                Default: <span className="font-mono font-semibold text-slate-800">admin</span> /{' '}
                <span className="font-mono font-semibold text-slate-800">admin</span> (atau PIN:{' '}
                <span className="font-mono font-semibold text-slate-800">1234</span>)
              </div>
            </div>

            <div className="text-center mt-5">
              <Link
                href="/"
                className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-medium"
              >
                <Coffee className="w-3 h-3" />
                <span>Kembali ke Web Customer</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Top bar ketika sudah login */
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-11 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block"></span>
                Admin Panel
              </span>

              <nav className="flex items-center gap-1 border-l border-slate-200 pl-3">
                <Link
                  href="/admin"
                  className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                    pathname === '/admin'
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Dashboard
                  </span>
                </Link>
                <Link
                  href="/admin/pos"
                  className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                    pathname === '/admin/pos'
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Coffee className="w-3 h-3" /> POS Kasir
                  </span>
                </Link>
                <Link
                  href="/admin/menu"
                  className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                    pathname === '/admin/menu'
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <LayoutDashboard className="w-3 h-3" /> Menu
                  </span>
                </Link>
                <Link
                  href="/admin/reports"
                  className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                    pathname === '/admin/reports'
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Laporan
                  </span>
                </Link>
                <Link
                  href="/queue"
                  className="px-2.5 py-1 rounded-full font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-1">
                    <Monitor className="w-3 h-3" /> Antrian
                  </span>
                </Link>
                <Link
                  href="/"
                  className="px-2.5 py-1 rounded-full font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3" /> Menu Customer
                  </span>
                </Link>
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium text-xs"
              title="Kunci / Keluar dari Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Kunci / Keluar</span>
            </button>
          </div>
        </div>
      )}

      {/* SELALU RENDER children agar Next.js tidak drop segment route */}
      <div className={!isAuthenticated ? 'hidden' : 'block'}>
        {children}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center text-xs text-slate-400">
          Memuat...
        </div>
      }
    >
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </Suspense>
  );
}
