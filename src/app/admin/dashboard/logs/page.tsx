'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/AdminHeader';
import { ActivityLog } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { History, Shield, RefreshCw, Loader2, Filter, Activity } from 'lucide-react';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/logs?limit=150');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.data || []);
      }
    } catch (e) {
      console.error('Failed to load logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (typeFilter === 'ALL') return true;
    return log.record_type === typeFilter;
  });

  return (
    <>
      <AdminHeader
        title="Activity Audit Logs"
        subtitle="Immutable security trail of administrative operations"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <History className="w-5 h-5 text-[#A50021]" /> Security Audit Trail
            </h2>
            <p className="text-xs text-gray-500">
              Captures donor registrations, patient requests, status updates, exports, and logins.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-800 bg-white"
            >
              <option value="ALL">All Event Types</option>
              <option value="donor">Donor Events</option>
              <option value="blood_request">Blood Request Events</option>
              <option value="auth">Auth &amp; Session Events</option>
              <option value="export">Export Events</option>
            </select>

            <button
              onClick={fetchLogs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#A50021]" />
              <p className="text-xs">Loading audit trail...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900">No Activity Logs</h3>
              <p className="text-xs text-gray-500 mt-1">No logs match the current filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Administrator / Agent</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Action Taken</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-800">
                        {log.admin_name || 'System Administrator'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-gray-100 text-gray-700">
                          {log.record_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-gray-600 max-w-md truncate">
                        {log.details || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
