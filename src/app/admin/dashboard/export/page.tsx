'use client';

import React, { useState } from 'react';
import AdminHeader from '@/components/AdminHeader';
import { BLOOD_GROUPS, KERALA_DISTRICTS } from '@/lib/constants';
import { FileSpreadsheet, Download, ShieldCheck, Users, Droplet, CheckCircle2 } from 'lucide-react';

export default function ExportDataPage() {
  const [donorGroup, setDonorGroup] = useState('ALL');
  const [donorDistrict, setDonorDistrict] = useState('ALL');

  const [reqGroup, setReqGroup] = useState('ALL');
  const [reqDistrict, setReqDistrict] = useState('ALL');

  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExportDonors = () => {
    const params = new URLSearchParams({ type: 'donors' });
    if (donorGroup !== 'ALL') params.set('blood_group', donorGroup);
    if (donorDistrict !== 'ALL') params.set('district', donorDistrict);

    window.open(`/api/export?${params.toString()}`, '_blank');
    setExportNotice('Donor records export initiated. Activity logged in audit trail.');
    setTimeout(() => setExportNotice(null), 5000);
  };

  const handleExportRequests = () => {
    const params = new URLSearchParams({ type: 'requests' });
    if (reqGroup !== 'ALL') params.set('blood_group', reqGroup);
    if (reqDistrict !== 'ALL') params.set('district', reqDistrict);

    window.open(`/api/export?${params.toString()}`, '_blank');
    setExportNotice('Blood requests export initiated. Activity logged in audit trail.');
    setTimeout(() => setExportNotice(null), 5000);
  };

  return (
    <>
      <AdminHeader
        title="Export Data &amp; Reports"
        subtitle="Standard CSV and Excel-compatible data exports"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#A50021]" /> Administrative Data Export Module
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Export official database records for offline medical camp coordination, government reporting, or institutional NSS archival.
          </p>
        </div>

        {exportNotice && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>{exportNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Donors Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-[#A50021] flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Export Voluntary Donor Registry
                </h3>
                <p className="text-xs text-gray-500">CSV spreadsheet of registered blood donors</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Filter by Blood Group</label>
                <select
                  value={donorGroup}
                  onChange={(e) => setDonorGroup(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="ALL">All Blood Groups</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>Blood Group {bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Filter by District</label>
                <select
                  value={donorDistrict}
                  onChange={(e) => setDonorDistrict(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="ALL">All Districts</option>
                  {KERALA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleExportDonors}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#A50021] hover:bg-[#7B0019] shadow transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD DONORS CSV</span>
              </button>
            </div>
          </div>

          {/* Export Requests Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-[#A50021] flex items-center justify-center font-bold">
                <Droplet className="w-5 h-5 fill-[#A50021]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Export Blood Requests Log
                </h3>
                <p className="text-xs text-gray-500">CSV spreadsheet of hospital cases</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Filter by Blood Group</label>
                <select
                  value={reqGroup}
                  onChange={(e) => setReqGroup(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="ALL">All Blood Groups</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>Blood Group {bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Filter by District</label>
                <select
                  value={reqDistrict}
                  onChange={(e) => setReqDistrict(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="ALL">All Districts</option>
                  {KERALA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleExportRequests}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-300 shadow-2xs transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-[#A50021]" />
                <span>DOWNLOAD REQUESTS CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Confidentiality Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-600 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-gray-900 font-semibold">Security Compliance Notice:</strong> Exported files contain sensitive personal telephone numbers and hospital patient records. Keep exported files strictly on password-protected institution drives. Never post exported CSVs to public web pages or messaging groups. All export downloads are stamped in the activity logs.
          </p>
        </div>
      </div>
    </>
  );
}
