'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut,
  ShieldCheck,
  Lock,
  Coffee,
  User,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShoppingBag,
  Layers
} from 'lucide-react';

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

  const isAdminSubMenu = pathname !== '/admin';

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
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-2.5 text-xs">
            {/* Bagian Kiri: Switcher Dashboard Admin & Customer + Tombol Kembali */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Mode Switcher Pill */}
              <div className="h-8 inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                <Link
                  href="/admin"
                  className={`h-full px-3 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    pathname.startsWith('/admin')
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Dashboard Admin</span>
                </Link>

                <Link
                  href="/"
                  className={`h-full px-3 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    !pathname.startsWith('/admin')
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-red-600" />
                  <span>Dashboard Customer</span>
                </Link>
              </div>

              {/* Tombol Kembalinya di atas saat pilih salah satu menu admin */}
              {isAdminSubMenu && (
                <Link
                  href="/admin"
                  className="h-8 inline-flex items-center gap-1.5 px-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 hover:bg-cyan-100 font-bold transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Dashboard Admin</span>
                </Link>
              )}
            </div>

            {/* Bagian Kanan: Tombol Logout */}
            <button
              onClick={handleLogout}
              className="h-8 flex items-center gap-1 px-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-bold text-xs shrink-0"
              title="Kunci / Keluar dari Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
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
