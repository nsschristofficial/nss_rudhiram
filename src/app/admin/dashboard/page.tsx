'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminHeader from '@/components/AdminHeader';
import { DashboardStats, ActivityLog } from '@/types';
import { formatDateTime } from '@/lib/utils';
import {
  Users,
  Droplet,
  Clock,
  CheckCircle,
  AlertTriangle,
  HeartHandshake,
  FileSpreadsheet,
  PlusCircle,
  ArrowRight,
  Loader2,
  Activity,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, logsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/logs?limit=8'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setRecentLogs(logsData.data);
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <AdminHeader
        title="Dashboard Overview"
        subtitle="Live administrative monitoring • NSS Units 20 & 49, Christ College"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Top Action & Refresh Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Operational Metrics
            </h2>
            <p className="text-xs text-gray-500">
              Live database figures computed across Christ College NSS voluntary records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-2xs transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#A50021]' : ''}`} />
              <span>Refresh Metrics</span>
            </button>

            <Link
              href="/admin/dashboard/match"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#A50021] text-white hover:bg-[#7B0019] shadow-sm transition"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Match Donors</span>
            </Link>
          </div>
        </div>

        {/* Emergency Alert Banner if Emergency Requests Exist */}
        {stats && stats.emergencyRequests > 0 && (
          <div className="p-4 rounded-2xl bg-red-600 text-white shadow-md flex items-center justify-between gap-4 animate-emergency-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                <AlertTriangle className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider">
                  Critical Emergency Notice: {stats.emergencyRequests} Active Emergency Blood Requirement(s)
                </h4>
                <p className="text-xs text-red-100">
                  Immediate attention required. Coordinated matching in progress.
                </p>
              </div>
            </div>
            <Link
              href="/admin/dashboard/requests?urgency=Emergency"
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-white text-[#A50021] hover:bg-red-50 shadow transition flex-shrink-0"
            >
              View Emergency Requests
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-gray-200 animate-pulse p-4" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Total Donors */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow transition">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Donors</span>
                <Users className="w-4 h-4 text-[#A50021]" />
              </div>
              <div className="text-3xl font-black text-gray-900 tracking-tight">
                {stats.totalDonors}
              </div>
              <div className="text-[11px] text-gray-500 mt-1 font-medium">
                Registered voluntary donors
              </div>
            </div>

            {/* Total Requests */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow transition">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Requests</span>
                <Droplet className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-gray-900 tracking-tight">
                {stats.totalRequests}
              </div>
              <div className="text-[11px] text-gray-500 mt-1 font-medium">
                Received patient cases
              </div>
            </div>

            {/* Pending Requests */}
            <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm hover:shadow transition bg-amber-50/20">
              <div className="flex items-center justify-between text-amber-700 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-amber-900 tracking-tight">
                {stats.pendingRequests}
              </div>
              <div className="text-[11px] text-amber-700 mt-1 font-medium">
                Awaiting donor matching
              </div>
            </div>

            {/* Completed Requests */}
            <div className="bg-white p-5 rounded-2xl border border-green-200/80 shadow-sm hover:shadow transition bg-green-50/20">
              <div className="flex items-center justify-between text-green-700 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-3xl font-black text-green-900 tracking-tight">
                {stats.completedRequests}
              </div>
              <div className="text-[11px] text-green-700 mt-1 font-medium">
                Successfully coordinated
              </div>
            </div>

            {/* Available Donors */}
            <div className="bg-white p-5 rounded-2xl border border-red-200/80 shadow-sm hover:shadow transition bg-red-50/20 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-[#A50021] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Available Donors</span>
                <ShieldCheck className="w-4 h-4 text-[#A50021]" />
              </div>
              <div className="text-3xl font-black text-[#A50021] tracking-tight">
                {stats.availableDonors}
              </div>
              <div className="text-[11px] text-red-800 mt-1 font-medium">
                Ready for active dispatch
              </div>
            </div>
          </div>
        ) : null}

        {/* Middle Section: Blood Groups Distribution + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Blood Group Inventory Distribution */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Donor Blood Group Distribution
                </h3>
                <p className="text-xs text-gray-500">
                  Total donor inventory calculated by blood type
                </p>
              </div>
              <Link
                href="/admin/dashboard/donors"
                className="text-xs font-bold text-[#A50021] hover:underline flex items-center gap-1"
              >
                Manage Donors <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(stats.bloodGroupCounts).map(([group, count]) => {
                  const percent =
                    stats.totalDonors > 0 ? Math.round((count / stats.totalDonors) * 100) : 0;
                  return (
                    <div
                      key={group}
                      className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-red-50/40 hover:border-red-200 transition"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="w-7 h-7 rounded-md bg-[#A50021] text-white flex items-center justify-center font-extrabold text-xs shadow-2xs">
                          {group}
                        </span>
                        <span className="text-base font-black text-gray-900">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2">
                        <div
                          className="bg-[#A50021] h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium block mt-1">
                        {percent}% of registered pool
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Coordination Tools */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">
                Administrative Shortcuts
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Fast coordination tasks for NSS officers
              </p>

              <div className="space-y-2.5">
                <Link
                  href="/admin/dashboard/match"
                  className="flex items-center justify-between p-3 rounded-xl bg-red-50/60 hover:bg-red-100/60 border border-red-200 text-xs font-bold text-[#A50021] transition"
                >
                  <span className="flex items-center gap-2.5">
                    <HeartHandshake className="w-4 h-4 text-[#A50021]" />
                    <span>Smart Donor Matching Engine</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/admin/dashboard/requests?status=Pending"
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-800 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <Droplet className="w-4 h-4 text-blue-600" />
                    <span>Review Pending Blood Requests</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/admin/dashboard/donors"
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-800 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <PlusCircle className="w-4 h-4 text-green-600" />
                    <span>Add Donor Record Manually</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/admin/dashboard/export"
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-800 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Export CSV Reports</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 text-[11px] text-gray-400">
              Session secured with Row Level Security &amp; audit tracking.
            </div>
          </div>
        </div>

        {/* Recent Activity Log Feed */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#A50021]" /> Recent Administrative Activity
              </h3>
              <p className="text-xs text-gray-500">
                Audit trail of submissions, status modifications, and coordinator events
              </p>
            </div>
            <Link
              href="/admin/dashboard/logs"
              className="text-xs font-bold text-[#A50021] hover:underline flex items-center gap-1"
            >
              View Full Audit Logs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {recentLogs.length === 0 ? (
              <p className="py-6 text-center text-xs text-gray-400">
                No recent activity logged.
              </p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">{log.action}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-600">
                        {log.record_type}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-xs text-gray-600 leading-relaxed">{log.details}</p>
                    )}
                    <span className="text-[11px] text-gray-400">
                      By {log.admin_name || 'System Administrator'}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono flex-shrink-0">
                    {formatDateTime(log.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
