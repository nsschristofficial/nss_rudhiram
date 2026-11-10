'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/AdminHeader';
import { AdminUser, AdminRole } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Shield,
  UserCheck,
  UserPlus,
  Trash2,
  Lock,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  KeyRound,
  Info,
} from 'lucide-react';

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer' as AdminRole,
    nss_unit: 'NSS Units 20 & 49',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchSessionAndAdmins = async () => {
    try {
      setLoading(true);
      const [sessionRes, adminsRes] = await Promise.all([
        fetch('/api/auth/session'),
        fetch('/api/admins'),
      ]);

      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setCurrentUser(sData.user);
      }

      if (adminsRes.ok) {
        const aData = await adminsRes.json();
        setAdmins(aData.data || []);
      }
    } catch (e) {
      console.error('Failed to load admins', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (form.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to create administrator');
      }

      setSuccessMsg(`Administrator account for ${form.name} created successfully!`);
      setIsAddModalOpen(false);
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'viewer',
        nss_unit: 'NSS Units 20 & 49',
      });
      fetchSessionAndAdmins();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating administrator');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admins?id=${adminToDelete.id}`, {
        method: 'DELETE',
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to delete administrator');
      }
      setAdminToDelete(null);
      fetchSessionAndAdmins();
    } catch (err: any) {
      alert(err.message || 'Error deleting administrator');
    } finally {
      setActionLoading(false);
    }
  };

  const isSuperAdmin = currentUser?.role === 'superadmin';

  return (
    <>
      <AdminHeader
        title="Administrator Accounts &amp; Access Control"
        subtitle="Manage administrator roles, coordinators, and read-only observers"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Role Explanation Card */}
        <div className="bg-gradient-to-r from-red-50/80 via-white to-gray-50 rounded-2xl border border-red-200 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A50021]">
            <Shield className="w-4 h-4" /> Role-Based Access Control (RBAC)
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            How Roles &amp; View-Only Portals Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-3.5 bg-white rounded-xl border border-gray-200 space-y-1 shadow-2xs">
              <span className="font-extrabold text-red-700 flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Super Administrator
              </span>
              <p className="text-gray-600">
                Full administrative access: add/edit/delete donors, update blood requests, export CSV, and create/manage other administrators.
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-gray-200 space-y-1 shadow-2xs">
              <span className="font-extrabold text-blue-700 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" /> Volunteer Coordinator
              </span>
              <p className="text-gray-600">
                Operational access: view donors, match donors, update request status to &apos;Under Review&apos; / &apos;Completed&apos;, and export reports.
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-amber-300 space-y-1 shadow-2xs bg-amber-50/30">
              <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-600" /> Read-Only Observer (View-Only)
              </span>
              <p className="text-gray-700">
                <strong>View-Only Portal:</strong> Can browse donor directory, view patient requests, and run donor matching, but <strong>CANNOT edit, delete, or add records</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Registered Administrators ({admins.length})
            </h3>
            <p className="text-xs text-gray-500">
              Authorized personnel with access to the RUDHIRAM coordination portal.
            </p>
          </div>

          {isSuperAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#A50021] text-white hover:bg-[#7B0019] shadow transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Administrator</span>
            </button>
          )}
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Administrators Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#A50021]" />
              <p className="text-xs">Loading administrator accounts...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Name &amp; Email</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Access Level</th>
                    <th className="py-3 px-4">Institutional Unit</th>
                    <th className="py-3 px-4">Created Date</th>
                    {isSuperAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {admins.map((admin) => {
                    const isPrimary = admin.id === 'admin_primary_01' || admin.email === 'admin@christcollegeijk.edu.in';
                    const isViewer = admin.role === 'viewer';

                    return (
                      <tr key={admin.id} className="hover:bg-gray-50 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900">{admin.name}</div>
                          <div className="text-[11px] text-gray-500 font-mono">{admin.email}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                              admin.role === 'superadmin'
                                ? 'bg-red-100 text-[#A50021] border border-red-200'
                                : isViewer
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-blue-100 text-blue-900 border border-blue-200'
                            }`}
                          >
                            {isViewer && <Eye className="w-3 h-3" />}
                            {admin.role === 'superadmin'
                              ? 'Super Administrator'
                              : isViewer
                              ? 'Read-Only Viewer'
                              : 'Coordinator'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-gray-700">
                          {isViewer ? (
                            <span className="font-semibold text-amber-800">
                              View-Only (Edits &amp; Deletions Disabled)
                            </span>
                          ) : (
                            <span className="font-semibold text-green-700">
                              Full Management Access
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-gray-600">
                          {admin.nss_unit || 'NSS Units 20 & 49'}
                        </td>

                        <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                          {formatDate(admin.created_at)}
                        </td>

                        {isSuperAdmin && (
                          <td className="py-3.5 px-4 text-right">
                            {isPrimary ? (
                              <span className="text-[11px] text-gray-400 font-medium italic">
                                Primary (Protected)
                              </span>
                            ) : (
                              <button
                                onClick={() => setAdminToDelete(admin)}
                                title="Delete administrator account"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-700 hover:bg-red-50 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ADD ADMINISTRATOR MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleCreateAdmin}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#A50021]" /> Add New Administrator
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Thomas George / Hospital Coordinator"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A50021]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Official Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@christcollegeijk.edu.in"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A50021]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Login Password * (minimum 6 characters)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A50021]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Assigned Role &amp; Access Level *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}
                  className="w-full px-3 py-2 border rounded-lg bg-white font-semibold"
                >
                  <option value="viewer">👁️ Read-Only Observer (View-Only Portal — No Edits)</option>
                  <option value="coordinator">Volunteer Coordinator (Operational Management)</option>
                  <option value="superadmin">Super Administrator (Full System Control)</option>
                </select>
                <p className="text-[11px] text-gray-500 mt-1">
                  Choose <strong>Read-Only Observer</strong> to give viewing &amp; matching access without edit permissions.
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Unit / Organisation</label>
                <input
                  type="text"
                  placeholder="e.g. NSS Unit 20 / Taluk Hospital Liaison"
                  value={form.nss_unit}
                  onChange={(e) => setForm({ ...form, nss_unit: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#A50021] hover:bg-[#7B0019] flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Create Administrator</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900">Remove Administrator?</h3>
              <p className="text-xs text-gray-600">
                Are you sure you want to remove <strong className="text-gray-900">{adminToDelete.name}</strong> ({adminToDelete.email})? They will immediately lose access to the portal.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAdminToDelete(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAdmin}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 flex items-center justify-center gap-1.5"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Remove Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
