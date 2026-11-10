'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/AdminHeader';
import { useAdmin } from '@/components/AdminContext';
import { Donor, BloodGroup, AvailabilityStatus } from '@/types';
import { BLOOD_GROUPS, KERALA_DISTRICTS } from '@/lib/constants';
import { formatDate, generateWhatsAppLink, isValidIndianMobile } from '@/lib/utils';
import {
  Users,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Eye,
  Phone,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function DonorManagementPage() {
  const { isViewer } = useAdmin();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroup, setBloodGroup] = useState('ALL');
  const [district, setDistrict] = useState('ALL');
  const [availability, setAvailability] = useState('ALL');

  // Modals state
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [donorToDelete, setDonorToDelete] = useState<Donor | null>(null);

  // Form states for Add / Edit
  const [modalForm, setModalForm] = useState({
    full_name: '',
    age: '',
    gender: 'Prefer not to say',
    blood_group: 'O+' as BloodGroup,
    mobile: '',
    email: '',
    district: 'Thrissur',
    locality: '',
    pincode: '680121',
    last_donation_date: '',
    availability: 'Available' as AvailabilityStatus,
    additional_information: '',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (bloodGroup !== 'ALL') params.set('blood_group', bloodGroup);
      if (district !== 'ALL') params.set('district', district);
      if (availability !== 'ALL') params.set('availability', availability);

      const res = await fetch(`/api/donors?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDonors(data.data || []);
      }
    } catch (e) {
      console.error('Failed to load donors:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [bloodGroup, district, availability]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDonors();
  };

  // Open Edit Modal
  const openEditModal = (donor: Donor) => {
    setSelectedDonor(donor);
    setModalForm({
      full_name: donor.full_name,
      age: String(donor.age),
      gender: donor.gender || 'Prefer not to say',
      blood_group: donor.blood_group,
      mobile: donor.mobile,
      email: donor.email || '',
      district: donor.district,
      locality: donor.locality,
      pincode: donor.pincode,
      last_donation_date: donor.last_donation_date || '',
      availability: donor.availability,
      additional_information: donor.additional_information || '',
    });
    setModalError(null);
    setIsEditModalOpen(true);
  };

  // Open Add Modal
  const openAddModal = () => {
    setModalForm({
      full_name: '',
      age: '',
      gender: 'Prefer not to say',
      blood_group: 'O+',
      mobile: '',
      email: '',
      district: 'Thrissur',
      locality: '',
      pincode: '680121',
      last_donation_date: '',
      availability: 'Available',
      additional_information: 'Manual desk registration by NSS administrator',
    });
    setModalError(null);
    setIsAddModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonor) return;
    setModalError(null);

    const ageNum = parseInt(modalForm.age, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
      setModalError('Age must be between 18 and 65.');
      return;
    }

    if (!isValidIndianMobile(modalForm.mobile)) {
      setModalError('Valid 10-digit mobile number required.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/donors/${selectedDonor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...modalForm,
          age: ageNum,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update donor');
      }

      setIsEditModalOpen(false);
      fetchDonors();
    } catch (err: any) {
      setModalError(err.message || 'Error updating donor');
    } finally {
      setActionLoading(false);
    }
  };

  // Save Add
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!modalForm.full_name.trim()) {
      setModalError('Full name is required.');
      return;
    }

    const ageNum = parseInt(modalForm.age, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
      setModalError('Age must be between 18 and 65.');
      return;
    }

    if (!isValidIndianMobile(modalForm.mobile)) {
      setModalError('Valid 10-digit mobile number required.');
      return;
    }

    if (!modalForm.locality.trim()) {
      setModalError('Locality / Place is required.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...modalForm,
          age: ageNum,
          consent: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add donor');
      }

      setIsAddModalOpen(false);
      fetchDonors();
    } catch (err: any) {
      setModalError(err.message || 'Error adding donor');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Donor
  const handleDeleteConfirm = async () => {
    if (!donorToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/donors/${donorToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete donor');
      }
      setDonorToDelete(null);
      fetchDonors();
    } catch (err: any) {
      alert(err.message || 'Error deleting donor');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick toggle availability
  const handleToggleAvailability = async (donor: Donor) => {
    const nextStatus: AvailabilityStatus =
      donor.availability === 'Available' ? 'Busy' : 'Available';

    try {
      await fetch(`/api/donors/${donor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: nextStatus }),
      });
      fetchDonors();
    } catch (err) {
      console.error('Failed to toggle availability', err);
    }
  };

  return (
    <>
      <AdminHeader
        title="Donor Management"
        subtitle="Confidential voluntary donor records • NSS Units 20 & 49"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Top Controls & Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-[#A50021]" /> Voluntary Donors Registry
              </h2>
              <p className="text-xs text-gray-500">
                Total matching records: <strong className="text-gray-900">{donors.length}</strong>
              </p>
            </div>

            {!isViewer && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#A50021] text-white hover:bg-[#7B0019] shadow transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Donor Manually</span>
              </button>
            )}
          </div>

          {/* Filters & Search Row */}
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, mobile, locality..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A50021]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>

            {/* Blood Group Filter */}
            <div>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#A50021]"
              >
                <option value="ALL">All Blood Groups</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    Blood Group {bg}
                  </option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#A50021]"
              >
                <option value="ALL">All Districts</option>
                {KERALA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#A50021]"
              >
                <option value="ALL">All Availabilities</option>
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </form>
        </div>

        {/* Donors Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#A50021]" />
              <p className="text-xs">Loading donor records from database...</p>
            </div>
          ) : donors.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900">No Donors Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                No donor records match your filter criteria. Try adjusting your search query or clear the filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Donor ID</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Group</th>
                    <th className="py-3 px-4">Age / Gen</th>
                    <th className="py-3 px-4">Mobile</th>
                    <th className="py-3 px-4">District / Place</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {donors.map((donor) => {
                    const isAvailable = donor.availability === 'Available';
                    return (
                      <tr key={donor.id} className="hover:bg-gray-50/80 transition">
                        {/* ID */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-gray-400">
                          {donor.id.slice(0, 8)}...
                        </td>

                        {/* Name */}
                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          {donor.full_name}
                        </td>

                        {/* Blood Group */}
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-md text-xs font-black bg-red-100 text-[#A50021] border border-red-200">
                            {donor.blood_group}
                          </span>
                        </td>

                        {/* Age / Gender */}
                        <td className="py-3.5 px-4 text-gray-600">
                          {donor.age} yrs • {donor.gender ? donor.gender.charAt(0) : '—'}
                        </td>

                        {/* Mobile */}
                        <td className="py-3.5 px-4 font-mono text-gray-900">
                          +91 {donor.mobile}
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4 text-gray-600">
                          <span className="font-semibold text-gray-800">{donor.locality}</span>
                          <span className="text-gray-400 block text-[10px]">{donor.district} ({donor.pincode})</span>
                        </td>

                        {/* Availability */}
                        <td className="py-3.5 px-4">
                          {isViewer ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                isAvailable
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : donor.availability === 'Busy'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-gray-100 text-gray-600 border-gray-300'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-600' : 'bg-amber-500'}`} />
                              {donor.availability}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleToggleAvailability(donor)}
                              title="Click to toggle availability"
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                                isAvailable
                                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                  : donor.availability === 'Busy'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                  : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-600' : 'bg-amber-500'}`} />
                              {donor.availability}
                            </button>
                          )}
                        </td>

                        {/* Registration Date */}
                        <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                          {formatDate(donor.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Call */}
                            <a
                              href={`tel:+91${donor.mobile}`}
                              title="Call donor"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-green-700 hover:bg-green-50 transition"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>

                            {/* WhatsApp */}
                            <a
                              href={generateWhatsAppLink(donor.mobile, donor.full_name, donor.blood_group)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Message donor on WhatsApp"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>

                            {/* View Details */}
                            <button
                              onClick={() => {
                                setSelectedDonor(donor);
                                setIsViewModalOpen(true);
                              }}
                              title="View full donor profile"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {!isViewer && (
                              <>
                                {/* Edit */}
                                <button
                                  onClick={() => openEditModal(donor)}
                                  title="Edit donor details"
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-[#A50021] hover:bg-red-50 transition"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => setDonorToDelete(donor)}
                                  title="Delete donor record"
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

      {/* VIEW DONOR MODAL */}
      {isViewModalOpen && selectedDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedDonor.full_name}</h3>
                <p className="text-xs text-gray-500">ID: {selectedDonor.id}</p>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-gray-700">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Blood Group</span>
                <span className="font-extrabold text-sm text-[#A50021]">{selectedDonor.blood_group}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Availability</span>
                <span className="font-bold text-gray-900">{selectedDonor.availability}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Mobile Number</span>
                <span className="font-bold font-mono text-gray-900">+91 {selectedDonor.mobile}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Age &amp; Gender</span>
                <span className="font-bold text-gray-900">{selectedDonor.age} years • {selectedDonor.gender || 'Not specified'}</span>
              </div>
              <div className="col-span-2 p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Email Address</span>
                <span className="font-medium text-gray-900">{selectedDonor.email || 'None provided'}</span>
              </div>
              <div className="col-span-2 p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Location &amp; PIN Code</span>
                <span className="font-bold text-gray-900">{selectedDonor.locality}, {selectedDonor.district} - {selectedDonor.pincode}</span>
              </div>
              <div className="col-span-2 p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Last Blood Donation Date</span>
                <span className="font-medium text-gray-900">{formatDate(selectedDonor.last_donation_date)}</span>
              </div>
              {selectedDonor.additional_information && (
                <div className="col-span-2 p-3 bg-red-50/50 rounded-xl border border-red-100">
                  <span className="text-gray-500 block mb-0.5 font-semibold">Notes / College Batch</span>
                  <p className="text-gray-800 leading-relaxed">{selectedDonor.additional_information}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <a
                href={generateWhatsAppLink(selectedDonor.mobile, selectedDonor.full_name, selectedDonor.blood_group)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Donor
              </a>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / ADD MODAL */}
      {(isEditModalOpen || isAddModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={isEditModalOpen ? handleSaveEdit : handleSaveAdd}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-fadeIn"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {isEditModalOpen ? 'Edit Voluntary Donor Record' : 'Add Donor Record Manually'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setIsAddModalOpen(false);
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium">
                {modalError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="col-span-2">
                <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={modalForm.full_name}
                  onChange={(e) => setModalForm({ ...modalForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Age (18-65) *</label>
                <input
                  type="number"
                  min={18}
                  max={65}
                  required
                  value={modalForm.age}
                  onChange={(e) => setModalForm({ ...modalForm, age: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Blood Group *</label>
                <select
                  value={modalForm.blood_group}
                  onChange={(e) => setModalForm({ ...modalForm, blood_group: e.target.value as BloodGroup })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Mobile Number (10 digits) *</label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={modalForm.mobile}
                  onChange={(e) => setModalForm({ ...modalForm, mobile: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Availability *</label>
                <select
                  value={modalForm.availability}
                  onChange={(e) => setModalForm({ ...modalForm, availability: e.target.value as AvailabilityStatus })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">District *</label>
                <select
                  value={modalForm.district}
                  onChange={(e) => setModalForm({ ...modalForm, district: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  {KERALA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Locality / Place *</label>
                <input
                  type="text"
                  required
                  value={modalForm.locality}
                  onChange={(e) => setModalForm({ ...modalForm, locality: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">PIN Code *</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={modalForm.pincode}
                  onChange={(e) => setModalForm({ ...modalForm, pincode: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Last Donation Date</label>
                <input
                  type="date"
                  value={modalForm.last_donation_date}
                  onChange={(e) => setModalForm({ ...modalForm, last_donation_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-bold text-gray-700 mb-1">Notes / Unit Batch</label>
                <textarea
                  rows={2}
                  value={modalForm.additional_information}
                  onChange={(e) => setModalForm({ ...modalForm, additional_information: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setIsAddModalOpen(false);
                }}
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
                <span>{isEditModalOpen ? 'Save Changes' : 'Add Donor'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {donorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900">Delete Donor Record?</h3>
              <p className="text-xs text-gray-600">
                Are you sure you want to remove <strong className="text-gray-900">{donorToDelete.full_name}</strong> ({donorToDelete.blood_group}) from the database? This action will be recorded in the activity audit logs.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDonorToDelete(null)}
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
                <span>Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
