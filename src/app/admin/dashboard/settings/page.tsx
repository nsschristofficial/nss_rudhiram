'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/AdminHeader';
import { AdminUser } from '@/types';
import { INSTITUTION_INFO } from '@/lib/constants';
import {
  Settings,
  Shield,
  Database,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Key,
  Server,
  FileCode,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setAdminUser(data.user);
        }
      } catch {}
    }
    loadUser();
  }, []);

  return (
    <>
      <AdminHeader
        title="Settings &amp; System Information"
        subtitle="Administrator configuration &amp; institutional infrastructure"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
        {/* Administrator Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#A50021] flex items-center justify-center font-bold text-lg shadow-2xs">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {adminUser?.name || 'NSS Programme Officer'}
              </h2>
              <p className="text-xs text-gray-500">
                {adminUser?.email || 'admin@christcollegeijk.edu.in'} • {adminUser?.nss_unit || 'NSS Units 20 & 49'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-gray-400 block mb-0.5">Assigned Role</span>
              <span className="font-bold text-gray-900 uppercase">
                {adminUser?.role || 'superadmin'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-gray-400 block mb-0.5">Institutional Unit</span>
              <span className="font-bold text-gray-900">
                NSS Units 20 &amp; 49
              </span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-gray-400 block mb-0.5">Session Security</span>
              <span className="font-bold text-green-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> HMAC SHA-256 (httpOnly)
              </span>
            </div>
          </div>
        </div>

        {/* Database & Infrastructure Architecture */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Database &amp; Supabase Integration Status
              </h3>
              <p className="text-xs text-gray-500">
                Dual-mode persistence engine with Supabase PostgreSQL and failover storage
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
            <p>
              RUDHIRAM is engineered with a production-grade <strong>Supabase PostgreSQL</strong> architecture, configured with Row Level Security (RLS) policies and automatic updated_at timestamp triggers.
            </p>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center justify-between font-semibold text-gray-900">
                <span className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#A50021]" /> PostgreSQL Migration File:
                </span>
                <span className="font-mono text-gray-600">supabase/migrations/20260101_init_rudhiram.sql</span>
              </div>
              <p className="text-gray-500 text-[11px]">
                Contains complete DDL for <code>donors</code>, <code>blood_requests</code>, <code>activity_logs</code>, and <code>admin_profiles</code> tables with RLS constraints.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="font-semibold text-gray-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" /> Connecting to Production Supabase:
              </div>
              <p className="text-gray-600">
                To connect to your live hosted Supabase PostgreSQL project, populate the following environment variables in your <code>.env.local</code> or Vercel Environment Variables:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_EMAIL=admin@christcollegeijk.edu.in
ADMIN_PASSWORD=your-secure-production-password
SESSION_SECRET=your-random-32-char-hmac-secret`}
              </pre>
            </div>
          </div>
        </div>

        {/* Security Checklist Verification */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Security &amp; Privacy Verification Checklist
              </h3>
              <p className="text-xs text-gray-500">
                Mandatory safeguards implemented across public and administrative layers
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block">No Public Donor Queries</strong>
                <span className="text-gray-500">Anonymous users cannot SELECT or search donors or patients.</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block">Server-Side Authorisation</strong>
                <span className="text-gray-500">Route middleware &amp; API session validation protects all endpoints.</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block">Rate Limiting &amp; Spam Protection</strong>
                <span className="text-gray-500">Submission cooldowns and input sanitation on all forms.</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block">CSV Formula Injection Safeguard</strong>
                <span className="text-gray-500">Export values starting with =, +, -, @ are sanitized against Excel injection.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
