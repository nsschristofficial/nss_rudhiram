'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import { useAdmin } from '@/components/AdminContext';
import { Donor, BloodGroup, BloodRequest } from '@/types';
import { BLOOD_GROUPS, KERALA_DISTRICTS } from '@/lib/constants';
import { formatDate, daysSince, isEligibleByDate, generateWhatsAppLink } from '@/lib/utils';
import {
  HeartHandshake,
  Search,
  Phone,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  ShieldAlert,
  Loader2,
  Eye,
  X,
  ExternalLink,
  Check,
  UserCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';

function MatchContent() {
  const { isViewer } = useAdmin();
  const searchParams = useSearchParams();
  const paramGroup = (searchParams.get('blood_group') as BloodGroup) || 'O+';
  const paramDistrict = searchParams.get('district') || 'Thrissur';
  const paramRequestId = searchParams.get('requestId') || '';

  const [targetGroup, setTargetGroup] = useState<BloodGroup>(paramGroup);
  const [district, setDistrict] = useState(paramDistrict);
  const [availableOnly, setAvailableOnly] = useState(true);

  const [loading, setLoading] = useState(false);
  const [exactMatches, setExactMatches] = useState<Donor[]>([]);
  const [compatibleMatches, setCompatibleMatches] = useState<Donor[]>([]);
  const [requestContext, setRequestContext] = useState<BloodRequest | null>(null);

  // All pending requests list to allow choosing request if none was pre-selected
  const [allPendingRequests, setAllPendingRequests] = useState<BloodRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>(paramRequestId);

  // View modal
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  // Connect Donor to Request confirmation modal
  const [connectingDonor, setConnectingDonor] = useState<Donor | null>(null);
  const [connectDate, setConnectDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectSuccessMessage, setConnectSuccessMessage] = useState<string | null>(null);
  const [connectErrorMessage, setConnectErrorMessage] = useState<string | null>(null);

  // Fetch pending requests for the dropdown
  useEffect(() => {
    async function loadRequests() {
      try {
        const res = await fetch('/api/requests');
        if (res.ok) {
          const data = await res.json();
          const pending = (data.data || []).filter(
            (r: BloodRequest) => r.status !== 'Completed' && r.status !== 'Cancelled'
          );
          setAllPendingRequests(pending);
        }
      } catch (err) {
        console.error('Failed to load pending requests', err);
      }
    }
    loadRequests();
  }, []);

  const performMatch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        blood_group: targetGroup,
        availableOnly: String(availableOnly),
      });
      if (district && district !== 'ALL') params.set('district', district);
      if (selectedRequestId) params.set('requestId', selectedRequestId);

      const res = await fetch(`/api/match?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setExactMatches(data.data.exactMatches || []);
        setCompatibleMatches(data.data.compatibleMatches || []);
        setRequestContext(data.data.requestContext || null);
      }
    } catch (e) {
      console.error('Match error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performMatch();
  }, [targetGroup, district, availableOnly, selectedRequestId]);

  // Handle request change from dropdown
  const handleSelectRequest = (reqId: string) => {
    setSelectedRequestId(reqId);
    if (!reqId) {
      setRequestContext(null);
      return;
    }
    const req = allPendingRequests.find((r) => r.id === reqId);
    if (req) {
      setRequestContext(req);
      setTargetGroup(req.blood_group);
      setDistrict(req.district);
    }
  };

  // Perform Connection: Request -> Completed, Donor -> Unavailable + cooldown
  const handleConfirmConnect = async () => {
    if (!connectingDonor || !selectedRequestId) {
      setConnectErrorMessage('Please select an active blood request to connect this donor to.');
      return;
    }

    setConnectLoading(true);
    setConnectErrorMessage(null);
    setConnectSuccessMessage(null);

    try {
      const res = await fetch('/api/match/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId: connectingDonor.id,
          requestId: selectedRequestId,
          donationDate: connectDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete donation connection.');
      }

      setConnectSuccessMessage(
        `✓ Success! ${connectingDonor.full_name} is now linked to this request. The request is marked COMPLETED, and the donor is now UNAVAILABLE until the 90-day cooldown period expires.`
      );

      // Refresh matches and request lists
      setTimeout(() => {
        setConnectingDonor(null);
        setConnectSuccessMessage(null);
        performMatch();
        // Remove completed request from pending list
        setAllPendingRequests((prev) => prev.filter((r) => r.id !== selectedRequestId));
        setSelectedRequestId('');
        setRequestContext(null);
      }, 2500);
    } catch (err: any) {
      setConnectErrorMessage(err.message || 'Error connecting donor to request.');
    } finally {
      setConnectLoading(false);
    }
  };

  const totalMatches = exactMatches.length + compatibleMatches.length;

  return (
    <>
      <AdminHeader
        title="Smart Donor Matching"
        subtitle="Initial administrative compatibility coordination & fulfillment"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Active Request Selection & Context Banner */}
        <div className="bg-gradient-to-r from-red-50/90 via-white to-gray-50 border border-red-200/90 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A50021] bg-white px-2.5 py-1 rounded-full border border-red-200 shadow-2xs">
                Active Hospital Request Target
              </span>
              <h3 className="text-base font-bold text-gray-900 mt-1">
                {requestContext
                  ? `Matching For: ${requestContext.patient_name} (${requestContext.blood_group} • ${requestContext.units_required} unit${requestContext.units_required > 1 ? 's' : ''})`
                  : 'Select an active patient blood request to link with a matching donor'}
              </h3>
            </div>

            {/* Quick Request Selector */}
            <div className="w-full md:w-80">
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                Active Blood Request:
              </label>
              <select
                value={selectedRequestId}
                onChange={(e) => handleSelectRequest(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 bg-white font-medium focus:ring-2 focus:ring-[#A50021] focus:outline-none"
              >
                <option value="">— Browse General Matching (No Request) —</option>
                {allPendingRequests.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.blood_group}] {r.patient_name} - {r.hospital_name} ({r.urgency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Context Details if a Request is selected */}
          {requestContext && (
            <div className="pt-3 border-t border-red-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-700 bg-white/70 p-3.5 rounded-2xl">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Hospital Location</span>
                <span className="font-semibold text-gray-900">{requestContext.hospital_name}</span>
                <span className="block text-gray-500 text-[11px]">{requestContext.hospital_location}, {requestContext.district}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Attender / Contact</span>
                <span className="font-semibold text-gray-900">{requestContext.contact_person}</span>
                <a href={`tel:+91${requestContext.contact_number}`} className="block text-[#A50021] font-mono font-bold">
                  +91 {requestContext.contact_number}
                </a>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Urgency & Date Required</span>
                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase mr-2 ${
                  requestContext.urgency === 'Emergency'
                    ? 'bg-red-600 text-white'
                    : requestContext.urgency === 'Urgent'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {requestContext.urgency}
                </span>
                <span className="font-medium text-gray-700">{formatDate(requestContext.required_date)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">
                Matching Parameters
              </h3>
              <p className="text-xs text-gray-500">
                Filter by recipient blood compatibility and district proximity.
              </p>
            </div>
            <span className="text-xs font-bold text-gray-600">
              Total Potential Donors: <strong className="text-[#A50021]">{totalMatches}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
            {/* Target Blood Group */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Target Blood Group
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {BLOOD_GROUPS.map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setTargetGroup(bg)}
                    className={`py-1.5 rounded-xl text-xs font-extrabold border transition ${
                      targetGroup === bg
                        ? 'bg-[#A50021] text-white border-[#7B0019] shadow-sm'
                        : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Target District */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Priority District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#A50021]"
              >
                <option value="ALL">All Districts</option>
                {KERALA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 p-2.5 rounded-xl border border-gray-200 w-full">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="w-4 h-4 text-[#A50021] rounded focus:ring-[#A50021]"
                />
                <span className="text-xs font-semibold text-gray-700">
                  Available Donors Only
                </span>
              </label>
            </div>

            {/* Refresh Match */}
            <div>
              <button
                onClick={performMatch}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#A50021] hover:bg-[#7B0019] shadow transition flex items-center justify-center gap-1.5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Refresh Matches ({totalMatches})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Matching Results */}
        {loading ? (
          <div className="p-12 text-center text-gray-400 bg-white rounded-3xl border">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#A50021]" />
            <p className="text-xs">Computing matching voluntary donors...</p>
          </div>
        ) : totalMatches === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-3xl border">
            <HeartHandshake className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">No Matching Donors Found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              No registered donors match blood group {targetGroup} in {district}. Try selecting &apos;All Districts&apos; or unchecking &apos;Available Donors Only&apos;.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* GROUP 1: EXACT MATCHES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">
                    Exact Blood Group Matches ({targetGroup}) — {exactMatches.length} Donor(s)
                  </h3>
                </div>
                <span className="text-xs text-gray-500 font-medium">Highest clinical priority</span>
              </div>

              {exactMatches.length === 0 ? (
                <div className="p-4 bg-white rounded-2xl border border-dashed border-gray-300 text-center text-xs text-gray-500">
                  No exact {targetGroup} donors registered in this filter range.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exactMatches.map((donor) => renderDonorCard(donor, requestContext))}
                </div>
              )}
            </div>

            {/* GROUP 2: CLINICALLY COMPATIBLE MATCHES */}
            {compatibleMatches.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">
                      Clinically Compatible Universal / Alternative Donors — {compatibleMatches.length} Donor(s)
                    </h3>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Compatible alternative RBC groups</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {compatibleMatches.map((donor) => renderDonorCard(donor, requestContext))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* VIEW DONOR DETAIL MODAL */}
      {selectedDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">{selectedDonor.full_name}</h3>
              <button
                onClick={() => setSelectedDonor(null)}
                className="p-1 rounded text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Blood Group:</span>
                <span className="font-extrabold text-[#A50021]">{selectedDonor.blood_group}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Age &amp; Gender:</span>
                <span>{selectedDonor.age} years • {selectedDonor.gender || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Mobile Number:</span>
                <span className="font-mono font-bold">+91 {selectedDonor.mobile}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Location:</span>
                <span>{selectedDonor.locality}, {selectedDonor.district} ({selectedDonor.pincode})</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Availability:</span>
                <span className="font-bold text-green-700">{selectedDonor.availability}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Last Blood Donation:</span>
                <span>{formatDate(selectedDonor.last_donation_date)}</span>
              </div>
              {selectedDonor.additional_information && (
                <div className="pt-2">
                  <span className="text-gray-500 font-semibold block mb-1">Batch / Volunteer Notes:</span>
                  <p className="bg-gray-50 p-2.5 rounded-xl text-gray-800 leading-relaxed">
                    {selectedDonor.additional_information}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setSelectedDonor(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONNECT DONOR TO REQUEST CONFIRMATION MODAL */}
      {connectingDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Connect Donor &amp; Complete Request
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Automated clinical status update &amp; 90-day cooldown schedule
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConnectingDonor(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {connectSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium space-y-1">
                <p>{connectSuccessMessage}</p>
              </div>
            )}

            {connectErrorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {connectErrorMessage}
              </div>
            )}

            {!connectSuccessMessage && (
              <>
                <div className="space-y-3 text-xs bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Selected Voluntary Donor:</span>
                    <span className="font-bold text-gray-900">
                      {connectingDonor.full_name} ({connectingDonor.blood_group})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Donor Mobile:</span>
                    <span className="font-mono font-bold text-gray-900">
                      +91 {connectingDonor.mobile}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
                    <span className="text-gray-500">Target Blood Request:</span>
                    <span className="font-bold text-[#A50021]">
                      {requestContext ? `${requestContext.patient_name} (${requestContext.hospital_name})` : 'None selected'}
                    </span>
                  </div>
                </div>

                {/* If no request was preselected, prompt to choose */}
                {!requestContext && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Choose which Blood Request to fulfill:
                    </label>
                    <select
                      value={selectedRequestId}
                      onChange={(e) => handleSelectRequest(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 bg-white font-medium"
                    >
                      <option value="">— Select Pending Request —</option>
                      {allPendingRequests.map((r) => (
                        <option key={r.id} value={r.id}>
                          [{r.blood_group}] {r.patient_name} - {r.hospital_name} ({r.urgency})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Donation Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Donation Fulfilled Date:
                  </label>
                  <input
                    type="date"
                    value={connectDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setConnectDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 bg-white"
                  />
                  <span className="text-[11px] text-gray-500 mt-0.5 block">
                    The donor will automatically be set to <strong>Unavailable (Busy)</strong> and eligible again in 90 days.
                  </span>
                </div>

                {/* What Happens Checklist */}
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-[11px] text-blue-900 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Automatic Actions Upon Confirmation:
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-blue-800">
                    <li>The patient request will be moved to <strong>Completed</strong>.</li>
                    <li>Donor availability will switch from Available to <strong>Busy</strong>.</li>
                    <li>Last donation date will update to <strong>{connectDate}</strong> (starting the 90-day cooldown).</li>
                    <li>An official entry will be recorded in the administrative audit log.</li>
                  </ul>
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setConnectingDonor(null)}
                    disabled={connectLoading}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmConnect}
                    disabled={connectLoading || !selectedRequestId}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition flex items-center gap-1.5"
                  >
                    {connectLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Confirm Connection &amp; Complete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );

  function renderDonorCard(donor: Donor, reqContext: BloodRequest | null) {
    const isEligible = isEligibleByDate(donor.last_donation_date);
    const elapsedDays = daysSince(donor.last_donation_date);
    const hospitalName = reqContext ? `${reqContext.hospital_name} (${reqContext.hospital_location})` : undefined;

    return (
      <div
        key={donor.id}
        className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs hover:shadow-md hover:border-red-200 transition flex flex-col justify-between space-y-4"
      >
        <div className="space-y-3">
          {/* Header Row */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-bold text-gray-900 leading-tight">
                {donor.full_name}
              </h4>
              <p className="text-[11px] text-gray-500">
                {donor.age} yrs • {donor.locality}, {donor.district}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-red-100 text-[#A50021] border border-red-200">
              {donor.blood_group}
            </span>
          </div>

          {/* Eligibility & Interval Badge */}
          <div className="text-[11px] space-y-1">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isEligible ? 'bg-green-600' : 'bg-amber-500'}`} />
              <span className={isEligible ? 'text-green-700 font-bold' : 'text-amber-700 font-bold'}>
                {isEligible ? 'Eligible by 90-day interval' : 'Recent donor (< 90 days)'}
              </span>
            </div>
            <div className="text-gray-500">
              Last donated:{' '}
              <strong className="text-gray-700">
                {donor.last_donation_date
                  ? `${formatDate(donor.last_donation_date)} (${elapsedDays} days ago)`
                  : 'Never or not specified'}
              </strong>
            </div>
            <div className="text-gray-500">
              Status:{' '}
              <strong className={donor.availability === 'Available' ? 'text-green-700' : 'text-amber-700'}>
                {donor.availability}
              </strong>
            </div>
          </div>
        </div>

        {/* Action Buttons: Connect, Call, WhatsApp */}
        <div className="pt-3 border-t border-gray-100 space-y-2">
          {/* PRIMARY BUTTON: Connect Donor to Request */}
          {!isViewer && (
            <button
              onClick={() => setConnectingDonor(donor)}
              className="w-full py-2 px-3 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Connect Donor to Request</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            {/* Call */}
            <a
              href={`tel:+91${donor.mobile}`}
              className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3 h-3 text-[#A50021]" />
              <span>Call</span>
            </a>

            {/* WhatsApp */}
            <a
              href={generateWhatsAppLink(donor.mobile, donor.full_name, donor.blood_group, hospitalName)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3 h-3" />
              <span>WhatsApp</span>
            </a>

            {/* View Details */}
            <button
              onClick={() => setSelectedDonor(donor)}
              title="View donor notes"
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default function SmartDonorMatchingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#A50021]" />
          <p className="text-xs">Loading matching engine...</p>
        </div>
      }
    >
      <MatchContent />
    </Suspense>
  );
}
