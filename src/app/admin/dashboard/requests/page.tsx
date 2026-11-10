'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import { useAdmin } from '@/components/AdminContext';
import { BloodRequest, BloodGroup, RequestUrgency, RequestStatus } from '@/types';
import { BLOOD_GROUPS, KERALA_DISTRICTS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import {
  Droplet,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Edit,
  HeartHandshake,
  Phone,
  Building2,
  Loader2,
  X,
} from 'lucide-react';

const STATUS_OPTIONS: RequestStatus[] = [
  'Pending',
  'Under Review',
  'Donor Identified',
  'Completed',
  'Cancelled',
];

function RequestsContent() {
  const { isViewer } = useAdmin();
  const searchParams = useSearchParams();
  const initialUrgency = searchParams.get('urgency') || 'ALL';
  const initialStatus = searchParams.get('status') || 'ALL';

  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroup, setBloodGroup] = useState('ALL');
  const [district, setDistrict] = useState('ALL');
  const [urgency, setUrgency] = useState(initialUrgency);
  const [status, setStatus] = useState(initialStatus);

  // Modals
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<BloodRequest | null>(null);

  const [editForm, setEditForm] = useState({
    patient_name: '',
    contact_person: '',
    contact_number: '',
    blood_group: 'O+' as BloodGroup,
    units_required: 1,
    hospital_name: '',
    hospital_location: '',
    district: 'Thrissur',
    required_date: '',
    urgency: 'Normal' as RequestUrgency,
    status: 'Pending' as RequestStatus,
    additional_information: '',
  });

  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (bloodGroup !== 'ALL') params.set('blood_group', bloodGroup);
      if (district !== 'ALL') params.set('district', district);
      if (urgency !== 'ALL') params.set('urgency', urgency);
      if (status !== 'ALL') params.set('status', status);

      const res = await fetch(`/api/requests?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.data || []);
      }
    } catch (e) {
      console.error('Failed to load blood requests:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [bloodGroup, district, urgency, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  // Quick Status Change in Table
  const handleQuickStatusChange = async (id: string, newStatus: RequestStatus) => {
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const openEditModal = (r: BloodRequest) => {
    setSelectedRequest(r);
    setEditForm({
      patient_name: r.patient_name,
      contact_person: r.contact_person,
      contact_number: r.contact_number,
      blood_group: r.blood_group,
      units_required: r.units_required,
      hospital_name: r.hospital_name,
      hospital_location: r.hospital_location,
      district: r.district,
      required_date: r.required_date,
      urgency: r.urgency,
      status: r.status,
      additional_information: r.additional_information || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchRequests();
      }
    } catch (err) {
      alert('Error updating blood request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!requestToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/requests/${requestToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRequestToDelete(null);
        fetchRequests();
      }
    } catch (err) {
      alert('Error deleting blood request');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <AdminHeader
        title="Blood Requests Management"
        subtitle="Patient coordination & emergency hospital cases"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Controls Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Droplet className="w-5 h-5 text-[#A50021]" /> Patient Blood Requests
              </h2>
              <p className="text-xs text-gray-500">
                Active hospital requests: <strong className="text-gray-900">{requests.length}</strong>
              </p>
            </div>

            <Link
              href="/admin/dashboard/match"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#A50021] text-white hover:bg-[#7B0019] shadow transition"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Launch Matching Engine</span>
            </Link>
          </div>

          {/* Filters Form */}
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient, hospital, contact..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A50021]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>

            {/* Blood Group */}
            <div>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-800 bg-white"
              >
                <option value="ALL">All Blood Groups</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>Blood Group {bg}</option>
                ))}
              </select>
            </div>

            {/* Urgency */}
            <div>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-800 bg-white font-semibold"
              >
                <option value="ALL">All Urgencies</option>
                <option value="Emergency">🚨 Emergency Only</option>
                <option value="Urgent">⚠️ Urgent</option>
                <option value="Normal">Normal</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-800 bg-white"
              >
                <option value="ALL">All Statuses</option>
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-800 bg-white"
              >
                <option value="ALL">All Districts</option>
                {KERALA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#A50021]" />
              <p className="text-xs">Loading blood requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Droplet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900">No Blood Requests Found</h3>
              <p className="text-xs text-gray-500 mt-1">No requests currently match the selected filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Urgency</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Group / Units</th>
                    <th className="py-3 px-4">Hospital &amp; District</th>
                    <th className="py-3 px-4">Contact Person</th>
                    <th className="py-3 px-4">Required Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Matching &amp; Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((r) => {
                    const isEmergency = r.urgency === 'Emergency';
                    const isUrgent = r.urgency === 'Urgent';

                    return (
                      <tr
                        key={r.id}
                        className={`hover:bg-gray-50 transition ${
                          isEmergency ? 'bg-red-50/40 font-medium' : ''
                        }`}
                      >
                        {/* Urgency Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              isEmergency
                                ? 'bg-red-600 text-white animate-pulse'
                                : isUrgent
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {isEmergency && <AlertTriangle className="w-3 h-3" />}
                            {r.urgency}
                          </span>
                        </td>

                        {/* Patient Name */}
                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          {r.patient_name}
                        </td>

                        {/* Blood Group & Units */}
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-md text-xs font-black bg-red-100 text-[#A50021] border border-red-200 mr-1.5">
                            {r.blood_group}
                          </span>
                          <span className="font-semibold text-gray-700">
                            {r.units_required} {r.units_required === 1 ? 'unit' : 'units'}
                          </span>
                        </td>

                        {/* Hospital */}
                        <td className="py-3.5 px-4 text-gray-600">
                          <span className="font-semibold text-gray-900 block truncate max-w-[180px]">
                            {r.hospital_name}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {r.hospital_location}, {r.district}
                          </span>
                        </td>

                        {/* Contact Person */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-gray-900 block">{r.contact_person}</span>
                          <a
                            href={`tel:+91${r.contact_number}`}
                            className="font-mono text-gray-500 hover:text-[#A50021] flex items-center gap-1 text-[11px]"
                          >
                            <Phone className="w-3 h-3" /> +91 {r.contact_number}
                          </a>
                        </td>

                        {/* Required Date */}
                        <td className="py-3.5 px-4 text-gray-600 font-medium">
                          {formatDate(r.required_date)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {isViewer ? (
                            <span
                              className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                                r.status === 'Completed'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : r.status === 'Donor Identified'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : r.status === 'Under Review'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : r.status === 'Cancelled'
                                  ? 'bg-gray-100 text-gray-500 border-gray-300'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              {r.status}
                            </span>
                          ) : (
                            <select
                              value={r.status}
                              onChange={(e) => handleQuickStatusChange(r.id, e.target.value as RequestStatus)}
                              className={`px-2 py-1 rounded-md text-[11px] font-bold border ${
                                r.status === 'Completed'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : r.status === 'Donor Identified'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : r.status === 'Under Review'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : r.status === 'Cancelled'
                                  ? 'bg-gray-100 text-gray-500 border-gray-300'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              {STATUS_OPTIONS.map((st) => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                          )}
                        </td>

                        {/* Actions & Match Donors Button */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Match Donors Button */}
                            <Link
                              href={`/admin/dashboard/match?requestId=${r.id}&blood_group=${encodeURIComponent(r.blood_group)}&district=${encodeURIComponent(r.district)}`}
                              title="Match voluntary donors for this patient"
                              className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-[#A50021] text-white hover:bg-[#7B0019] shadow-2xs flex items-center gap-1 transition"
                            >
                              <HeartHandshake className="w-3 h-3" />
                              <span>Match</span>
                            </Link>

                            <button
                              onClick={() => {
                                setSelectedRequest(r);
                                setIsViewModalOpen(true);
                              }}
                              title="View details"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {!isViewer && (
                              <>
                                <button
                                  onClick={() => openEditModal(r)}
                                  title="Edit request"
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-[#A50021] hover:bg-red-50 transition"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setRequestToDelete(r)}
                                  title="Delete request"
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-700 hover:bg-red-50 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Patient Request Details</h3>
                <p className="text-xs text-gray-400">ID: {selectedRequest.id}</p>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-gray-700">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Patient Name</span>
                <span className="font-bold text-sm text-gray-900">{selectedRequest.patient_name}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Required Blood Group</span>
                <span className="font-extrabold text-sm text-[#A50021]">{selectedRequest.blood_group} ({selectedRequest.units_required} units)</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Urgency Level</span>
                <span className="font-bold text-gray-900">{selectedRequest.urgency}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Current Status</span>
                <span className="font-bold text-gray-900">{selectedRequest.status}</span>
              </div>
              <div className="col-span-2 p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Hospital &amp; Location</span>
                <span className="font-semibold text-gray-900">{selectedRequest.hospital_name}, {selectedRequest.hospital_location} ({selectedRequest.district})</span>
              </div>
              <div className="col-span-2 p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Contact Person &amp; Phone</span>
                <span className="font-semibold text-gray-900">{selectedRequest.contact_person} • +91 {selectedRequest.contact_number}</span>
              </div>
              <div className="col-span-2 p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Required Date</span>
                <span className="font-semibold text-gray-900">{formatDate(selectedRequest.required_date)}</span>
              </div>
              {selectedRequest.additional_information && (
                <div className="col-span-2 p-3 bg-red-50/50 rounded-xl border border-red-100">
                  <span className="text-gray-500 block mb-0.5 font-semibold">Surgery / Case Notes</span>
                  <p className="text-gray-800 leading-relaxed">{selectedRequest.additional_information}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Link
                href={`/admin/dashboard/match?requestId=${selectedRequest.id}&blood_group=${encodeURIComponent(selectedRequest.blood_group)}&district=${encodeURIComponent(selectedRequest.district)}`}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#A50021] hover:bg-[#7B0019] flex items-center gap-1.5 transition"
              >
                <HeartHandshake className="w-3.5 h-3.5" /> Match Donors Now
              </Link>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-fadeIn"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">Edit Blood Request</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={editForm.patient_name}
                  onChange={(e) => setEditForm({ ...editForm, patient_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Required Blood Group</label>
                <select
                  value={editForm.blood_group}
                  onChange={(e) => setEditForm({ ...editForm, blood_group: e.target.value as BloodGroup })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Units Required</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={editForm.units_required}
                  onChange={(e) => setEditForm({ ...editForm, units_required: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Urgency</label>
                <select
                  value={editForm.urgency}
                  onChange={(e) => setEditForm({ ...editForm, urgency: e.target.value as RequestUrgency })}
                  className="w-full px-3 py-2 border rounded-lg bg-white font-semibold"
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as RequestStatus })}
                  className="w-full px-3 py-2 border rounded-lg bg-white font-semibold"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Required Date</label>
                <input
                  type="date"
                  required
                  value={editForm.required_date}
                  onChange={(e) => setEditForm({ ...editForm, required_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-bold text-gray-700 mb-1">Hospital Name</label>
                <input
                  type="text"
                  required
                  value={editForm.hospital_name}
                  onChange={(e) => setEditForm({ ...editForm, hospital_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  required
                  value={editForm.contact_person}
                  onChange={(e) => setEditForm({ ...editForm, contact_person: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Contact Mobile</label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={editForm.contact_number}
                  onChange={(e) => setEditForm({ ...editForm, contact_number: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-bold text-gray-700 mb-1">Notes / Case Details</label>
                <textarea
                  rows={2}
                  value={editForm.additional_information}
                  onChange={(e) => setEditForm({ ...editForm, additional_information: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#A50021] hover:bg-[#7B0019]"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {requestToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900">Delete Blood Request?</h3>
              <p className="text-xs text-gray-600">
                Are you sure you want to remove the request for <strong className="text-gray-900">{requestToDelete.patient_name}</strong> ({requestToDelete.blood_group})?
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRequestToDelete(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 flex items-center justify-center gap-1.5"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function BloodRequestsManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#A50021]" />
          <p className="text-xs">Loading blood requests...</p>
        </div>
      }
    >
      <RequestsContent />
    </Suspense>
  );
}
