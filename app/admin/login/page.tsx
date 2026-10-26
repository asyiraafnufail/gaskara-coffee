'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle, Coffee } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const isAuth = sessionStorage.getItem('gaskara_admin_session_auth');
    if (isAuth === 'authenticated') {
      router.push('/admin/menu');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    const u = username.trim().toLowerCase();
    const p = password.trim();

    // Validasi login: admin/admin atau PIN 1234
    if ((u === 'admin' && p === 'admin') || p === '1234' || (u === 'admin' && p === 'gaskara123')) {
      sessionStorage.setItem('gaskara_admin_session_auth', 'authenticated');
      localStorage.removeItem('gaskara_admin_auth');
      window.dispatchEvent(new CustomEvent('gaskara_admin_auth_changed'));
      router.push('/admin/menu');
    } else {
      setErrorMsg('Username atau password salah! (Gunakan: admin / admin atau PIN: 1234)');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand Card Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-600 text-white font-black text-xl mb-3">
            G
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Gaskara <span className="text-cyan-500">Admin</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Masuk untuk kelola menu & laporan keuangan
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
              Autentikasi Internal
            </span>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
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
              <span>{submitting ? 'Memeriksa...' : 'Masuk Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Credential Hint */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Akun default: <span className="font-mono font-semibold text-slate-800">admin</span> /{' '}
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
  );
}
