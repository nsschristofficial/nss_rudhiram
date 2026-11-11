'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Search,
  Filter,
  Download,
  Eye,
  FileSpreadsheet,
  Hospital,
  MapPin,
  Calendar,
  User,
  Phone,
  Droplet,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Printer,
  X,
  FileText,
  Clock,
  ArrowUpDown,
  CheckCircle,
} from 'lucide-react';
import { FulfillmentRecord, BloodGroup } from '@/types';
import { BLOOD_GROUPS, KERALA_DISTRICTS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { useAdmin } from '@/components/AdminContext';

export default function FulfillmentsPage() {
  const { adminUser } = useAdmin();
  const [fulfillments, setFulfillments] = useState<FulfillmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [bloodFilter, setBloodFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [hospitalFilter, setHospitalFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'patient_asc'>('date_desc');

  // Detail Modal
  const [selectedRecord, setSelectedRecord] = useState<FulfillmentRecord | null>(null);

  const fetchFulfillments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/fulfillments');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load fulfillments');
      setFulfillments(json.data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading fulfillments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFulfillments();
  }, []);

  // Extract unique hospital names for filter dropdown
  const uniqueHospitals = useMemo(() => {
    const set = new Set<string>();
    fulfillments.forEach((f) => {
      if (f.hospital_name) set.add(f.hospital_name.trim());
    });
    return Array.from(set).sort();
  }, [fulfillments]);

  // Filtered and sorted records
  const filteredRecords = useMemo(() => {
    let result = [...fulfillments];

    if (bloodFilter !== 'ALL') {
      result = result.filter((f) => f.blood_group === bloodFilter);
    }
    if (districtFilter !== 'ALL') {
      result = result.filter(
        (f) =>
          f.district.toLowerCase() === districtFilter.toLowerCase() ||
          f.donor_district.toLowerCase() === districtFilter.toLowerCase()
      );
    }
    if (hospitalFilter !== 'ALL') {
      result = result.filter((f) => f.hospital_name.toLowerCase() === hospitalFilter.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.patient_name.toLowerCase().includes(q) ||
          f.donor_name.toLowerCase().includes(q) ||
          f.hospital_name.toLowerCase().includes(q) ||
          f.patient_contact_number.includes(q) ||
          f.donor_mobile.includes(q) ||
          f.id.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'date_desc') {
      result.sort((a, b) => new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime());
    } else if (sortBy === 'date_asc') {
      result.sort((a, b) => new Date(a.donation_date).getTime() - new Date(b.donation_date).getTime());
    } else if (sortBy === 'patient_asc') {
      result.sort((a, b) => a.patient_name.localeCompare(b.patient_name));
    }

    return result;
  }, [fulfillments, bloodFilter, districtFilter, hospitalFilter, search, sortBy]);

  // Total units delivered
  const totalUnits = useMemo(() => {
    return filteredRecords.reduce((sum, f) => sum + (Number(f.units_required) || 1), 0);
  }, [filteredRecords]);

  // Export CSV handler
  const handleExportCSV = () => {
    const params = new URLSearchParams();
    params.set('type', 'fulfillments');
    if (bloodFilter !== 'ALL') params.set('blood_group', bloodFilter);
    if (districtFilter !== 'ALL') params.set('district', districtFilter);
    if (hospitalFilter !== 'ALL') params.set('hospital_name', hospitalFilter);

    window.open(`/api/export?${params.toString()}`, '_blank');
  };

  // Download Individual Fulfillment Slip (Printable / PDF / HTML)
  const handleDownloadSlip = (rec: FulfillmentRecord) => {
    const slipHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>NSS Rudhiram - Blood Donation Fulfillment Slip #${rec.id}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #b91c1c;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          .title {
            font-size: 24px;
            font-weight: 800;
            color: #b91c1c;
            margin: 0;
            letter-spacing: -0.5px;
          }
          .subtitle {
            font-size: 13px;
            color: #475569;
            margin-top: 4px;
          }
          .badge {
            display: inline-block;
            background: #fef2f2;
            color: #b91c1c;
            border: 1px solid #fecaca;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            margin-top: 8px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
          }
          .card {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
            background: #f8fafc;
          }
          .card h3 {
            margin: 0 0 12px 0;
            font-size: 15px;
            color: #0f172a;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 13px;
          }
          .row .label {
            color: #64748b;
          }
          .row .val {
            font-weight: 600;
            color: #0f172a;
            text-align: right;
          }
          .highlight {
            font-size: 20px;
            font-weight: 900;
            color: #b91c1c;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px dashed #cbd5e1;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">RUDHIRAM - CHRIST COLLEGE NSS BLOOD DESK</div>
          <div class="subtitle">Official Blood Donation & Connection Fulfillment Slip</div>
          <div class="badge">FULFILLED & VERIFIED RECORD</div>
        </div>

        <div style="background: #fff1f2; border: 1px solid #ffe4e6; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; display: flex; justify-content: space-between;">
          <div><strong>Fulfillment Ref:</strong> ${rec.id}</div>
          <div><strong>Donation Date:</strong> ${rec.donation_date}</div>
          <div><strong>Blood Group:</strong> <span class="highlight">${rec.blood_group}</span> (${rec.units_required} Unit)</div>
        </div>

        <div class="grid">
          <div class="card">
            <h3>Recipient / Patient Details</h3>
            <div class="row"><span class="label">Patient Name:</span> <span class="val">${rec.patient_name}</span></div>
            <div class="row"><span class="label">Hospital:</span> <span class="val">${rec.hospital_name}</span></div>
            <div class="row"><span class="label">Location:</span> <span class="val">${rec.hospital_location || 'N/A'}, ${rec.district}</span></div>
            <div class="row"><span class="label">Contact Person:</span> <span class="val">${rec.patient_contact_person}</span></div>
            <div class="row"><span class="label">Contact Phone:</span> <span class="val">+91 ${rec.patient_contact_number}</span></div>
            <div class="row"><span class="label">Request ID:</span> <span class="val">${rec.requestId}</span></div>
          </div>

          <div class="card">
            <h3>Connected Donor Details</h3>
            <div class="row"><span class="label">Donor Name:</span> <span class="val">${rec.donor_name}</span></div>
            <div class="row"><span class="label">Donor Contact:</span> <span class="val">+91 ${rec.donor_mobile}</span></div>
            <div class="row"><span class="label">Locality / District:</span> <span class="val">${rec.donor_locality ? rec.donor_locality + ', ' : ''}${rec.donor_district}</span></div>
            <div class="row"><span class="label">Cooldown Until:</span> <span class="val" style="color: #b91c1c;">${rec.cooldown_until}</span></div>
            <div class="row"><span class="label">Connected By:</span> <span class="val">${rec.connected_by}</span></div>
            <div class="row"><span class="label">Donor ID:</span> <span class="val">${rec.donorId}</span></div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 20px;">
          <h3>Fulfillment Administrative Notes</h3>
          <p style="font-size: 13px; color: #475569; margin: 0; line-height: 1.5;">
            ${rec.notes || 'Fulfilled via Christ College NSS Smart Donor Matching System.'}
          </p>
        </div>

        <div class="footer">
          <p>Christ College (Autonomous), Irinjalakuda - NSS Units 20 & 49 Blood Support Network</p>
          <p>Generated on ${new Date().toLocaleString()} | Verified by NSS Rudhiram Administrator (${rec.connected_by})</p>
        </div>

        <script>
          window.print();
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([slipHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.focus();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                Connected Fulfillments
              </h1>
              <p className="text-sm text-slate-500">
                Verified pairing records connecting registered donors to fulfilled blood requests
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchFulfillments}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold transition border border-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            Export Filtered (CSV)
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fulfilled Matches</div>
            <div className="text-2xl font-bold text-slate-900">{fulfillments.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-brand-red flex items-center justify-center">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Blood Units Delivered</div>
            <div className="text-2xl font-bold text-slate-900">{totalUnits} Units</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Hospital className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hospitals Served</div>
            <div className="text-2xl font-bold text-slate-900">{uniqueHospitals.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filter Results</div>
            <div className="text-2xl font-bold text-slate-900">{filteredRecords.length} Records</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient, donor, hospital, phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
            />
          </div>

          {/* Blood Group */}
          <div className="md:col-span-2">
            <select
              value={bloodFilter}
              onChange={(e) => setBloodFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
            >
              <option value="ALL">All Blood Groups</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div className="md:col-span-2">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
            >
              <option value="ALL">All Districts</option>
              {KERALA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Hospital */}
          <div className="md:col-span-2">
            <select
              value={hospitalFilter}
              onChange={(e) => setHospitalFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
            >
              <option value="ALL">All Hospitals</option>
              {uniqueHospitals.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="patient_asc">Patient Name (A-Z)</option>
            </select>
          </div>
        </div>

        {(bloodFilter !== 'ALL' || districtFilter !== 'ALL' || hospitalFilter !== 'ALL' || search) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Showing {filteredRecords.length} of {fulfillments.length} total connections
            </span>
            <button
              onClick={() => {
                setSearch('');
                setBloodFilter('ALL');
                setDistrictFilter('ALL');
                setHospitalFilter('ALL');
              }}
              className="text-brand-red font-semibold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Fulfillments Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-brand-red" />
            <p className="text-sm font-medium">Loading fulfillment pairing database...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={fetchFulfillments}
              className="mt-3 px-4 py-2 bg-red-50 text-red-700 rounded-xl text-xs font-semibold hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-base font-bold text-slate-700">No Connected Fulfillments Found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
              {fulfillments.length === 0
                ? 'When administrators connect donors to blood requests in the Smart Matching module, verified pairings will appear here.'
                : 'No pairing records match your current search and filter settings.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Patient & Hospital</th>
                  <th className="py-3.5 px-4">Connected Donor</th>
                  <th className="py-3.5 px-4 text-center">Blood & Units</th>
                  <th className="py-3.5 px-4">Donation Date</th>
                  <th className="py-3.5 px-4">Donor Cooldown</th>
                  <th className="py-3.5 px-4">Connected By</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 transition">
                    {/* Patient & Hospital */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{rec.patient_name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Hospital className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rec.hospital_name}</span>
                        <span className="text-slate-300">•</span>
                        <span>{rec.district}</span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>+91 {rec.patient_contact_number}</span>
                      </div>
                    </td>

                    {/* Connected Donor */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{rec.donor_name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rec.donor_locality ? `${rec.donor_locality}, ` : ''}{rec.donor_district}</span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>+91 {rec.donor_mobile}</span>
                      </div>
                    </td>

                    {/* Blood & Units */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-brand-red border border-rose-200">
                        {rec.blood_group}
                      </span>
                      <div className="text-xs text-slate-400 mt-1 font-medium">
                        {rec.units_required} {rec.units_required === 1 ? 'Unit' : 'Units'}
                      </div>
                    </td>

                    {/* Donation Date */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rec.donation_date}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Fulfilled: {formatDate(rec.created_at)}
                      </div>
                    </td>

                    {/* Cooldown */}
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Until {rec.cooldown_until}</span>
                      </div>
                    </td>

                    {/* Connected By */}
                    <td className="py-4 px-4">
                      <div className="text-xs font-semibold text-slate-700">{rec.connected_by}</div>
                      <div className="text-[11px] text-slate-400">Christ NSS Admin</div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedRecord(rec)}
                          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                          title="Open detailed pair view"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadSlip(rec)}
                          className="p-2 text-brand-red hover:text-brand-red-dark hover:bg-rose-50 rounded-xl transition"
                          title="Download / Print fulfillment slip"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Individual Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Connected Pair Details</h3>
                  <p className="text-xs text-slate-500">Record ID: {selectedRecord.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Highlight Banner */}
              <div className="bg-rose-50/60 border border-rose-100 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Blood Group Fulfilled</div>
                  <div className="text-2xl font-black text-brand-red">
                    {selectedRecord.blood_group} ({selectedRecord.units_required} {selectedRecord.units_required === 1 ? 'Unit' : 'Units'})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Donation Date</div>
                  <div className="text-base font-bold text-slate-800">{selectedRecord.donation_date}</div>
                </div>
              </div>

              {/* Side-by-side Recipient & Donor cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Patient / Recipient */}
                <div className="bg-slate-50/70 border border-slate-100 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-200 pb-2">
                    <User className="w-4 h-4 text-brand-red" />
                    <span>Patient / Recipient</span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Patient Name</div>
                    <div className="text-sm font-semibold text-slate-800">{selectedRecord.patient_name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Hospital</div>
                    <div className="text-sm font-semibold text-slate-800">{selectedRecord.hospital_name}</div>
                    <div className="text-xs text-slate-500">
                      {selectedRecord.hospital_location ? `${selectedRecord.hospital_location}, ` : ''}{selectedRecord.district}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Contact Person</div>
                    <div className="text-sm font-semibold text-slate-800">{selectedRecord.patient_contact_person}</div>
                    <div className="text-xs text-slate-500">+91 {selectedRecord.patient_contact_number}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Request Ref ID</div>
                    <div className="text-xs font-mono text-slate-600">{selectedRecord.requestId}</div>
                  </div>
                </div>

                {/* Connected Donor */}
                <div className="bg-slate-50/70 border border-slate-100 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-200 pb-2">
                    <Droplet className="w-4 h-4 text-emerald-600" />
                    <span>Connected Donor</span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Donor Name</div>
                    <div className="text-sm font-semibold text-slate-800">{selectedRecord.donor_name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Contact Number</div>
                    <div className="text-sm font-semibold text-slate-800">+91 {selectedRecord.donor_mobile}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Location</div>
                    <div className="text-sm font-semibold text-slate-800">
                      {selectedRecord.donor_locality ? `${selectedRecord.donor_locality}, ` : ''}{selectedRecord.donor_district}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Cooldown Active Until</div>
                    <div className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md inline-block border border-amber-200">
                      {selectedRecord.cooldown_until} (90 Days)
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Donor Ref ID</div>
                    <div className="text-xs font-mono text-slate-600">{selectedRecord.donorId}</div>
                  </div>
                </div>
              </div>

              {/* Administrative Info */}
              <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Administrative Details</div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-1">
                  <span>Connected by: <strong>{selectedRecord.connected_by}</strong></span>
                  <span>Recorded: <strong>{formatDate(selectedRecord.created_at)}</strong></span>
                </div>
                {selectedRecord.notes && (
                  <p className="text-xs text-slate-500 italic mt-2 pt-2 border-t border-slate-100">
                    &ldquo;{selectedRecord.notes}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 text-slate-600 hover:text-slate-800 font-semibold text-sm transition"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadSlip(selectedRecord)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl text-sm font-semibold shadow-sm transition"
              >
                <Printer className="w-4 h-4" />
                Download Slip / Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
