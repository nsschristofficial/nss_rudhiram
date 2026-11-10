'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Successful login -> navigate to admin dashboard
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Return to Public Website */}
      <div className="max-w-md mx-auto w-full mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#A50021] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to RUDHIRAM Public Portal
        </Link>
      </div>

      <div className="max-w-md mx-auto w-full bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
        {/* Header with Logos */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-200 p-0.5 bg-white shadow-sm">
              <Image
                src="/images/christ-college-logo.jpg"
                alt="Christ College Crest"
                fill
                className="object-contain"
                sizes="48px"
                priority
              />
            </div>
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-200 p-0.5 bg-white shadow-sm">
              <Image
                src="/images/nss-logo.png"
                alt="NSS Logo"
                fill
                className="object-contain"
                sizes="48px"
                priority
              />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-[#A50021] uppercase tracking-wider mb-1.5">
              <Shield className="w-3.5 h-3.5" /> Restricted Access
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              RUDHIRAM Admin Login
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              National Service Scheme (Units 20 &amp; 49) • Christ College (Autonomous)
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@christcollegeijk.edu.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A50021] focus:border-transparent text-sm text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-11 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A50021] focus:border-transparent text-sm text-gray-900 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-[#A50021] hover:bg-[#7B0019] focus:outline-none focus:ring-4 focus:ring-red-200 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Administrator...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>SIGN IN TO DASHBOARD</span>
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <p className="text-[11px] text-gray-400 text-center mt-6">
          Access is monitored and logged for institutional cybersecurity compliance.
        </p>
      </div>
    </div>
  );
}
