'use client';

import React, { useState } from 'react';
import { BloodGroup, RequestUrgency } from '@/types';
import { BLOOD_GROUPS, KERALA_DISTRICTS } from '@/lib/constants';
import { isValidIndianMobile } from '@/lib/utils';
import {
  Droplet,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Loader2,
  Phone,
  Shield,
  Clock,
  User,
  HeartHandshake,
} from 'lucide-react';

export default function BloodRequestForm() {
  const [formData, setFormData] = useState({
    patient_name: '',
    contact_person: '',
    contact_number: '',
    blood_group: '' as BloodGroup | '',
    units_required: 1,
    hospital_name: '',
    hospital_location: '',
    district: 'Thrissur',
    required_date: new Date().toISOString().split('T')[0],
    urgency: 'Normal' as RequestUrgency,
    additional_information: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successData, setSuccessData] = useState<{ id: string; patient: string } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg(null);
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleBloodGroupSelect = (group: BloodGroup) => {
    setFormData((prev) => ({ ...prev, blood_group: group }));
    if (errorMsg) setErrorMsg(null);
    if (fieldErrors.blood_group) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.blood_group;
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const errors: Record<string, string> = {};

    // Validation
    if (!formData.patient_name.trim() || formData.patient_name.trim().length < 2) {
      errors.patient_name = 'Patient Name is required.';
    }

    if (!formData.contact_person.trim() || formData.contact_person.trim().length < 2) {
      errors.contact_person = 'Attender / Contact Person name is required.';
    }

    if (!formData.contact_number.trim()) {
      errors.contact_number = 'Contact number is required.';
    } else if (!isValidIndianMobile(formData.contact_number)) {
      errors.contact_number = 'Enter a valid 10-digit Indian contact number.';
    }

    if (!formData.blood_group) {
      errors.blood_group = 'Please select required blood group.';
    }

    const units = parseInt(String(formData.units_required), 10);
    if (isNaN(units) || units < 1 || units > 50) {
      errors.units_required = 'Units required must be between 1 and 50.';
    }

    if (!formData.hospital_name.trim() || formData.hospital_name.trim().length < 2) {
      errors.hospital_name = 'Hospital or medical centre name is required.';
    }

    if (!formData.hospital_location.trim() || formData.hospital_location.trim().length < 2) {
      errors.hospital_location = 'Hospital location / city is required.';
    }

    if (!formData.required_date) {
      errors.required_date = 'Required date is mandatory.';
    } else {
      const reqDate = new Date(formData.required_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (reqDate < today) {
        errors.required_date = 'Required date cannot be in the past.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const missingList = Object.values(errors).join(' • ');
      setErrorMsg(`Please resolve the mandatory fields: ${missingList}`);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          units_required: units,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to submit blood request.');
      }

      setSuccessData({
        id: resData.requestId || 'REQ_CONFIRMED',
        patient: formData.patient_name,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting blood request. Please call our emergency desk directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setFormData({
      patient_name: '',
      contact_person: '',
      contact_number: '',
      blood_group: '' as BloodGroup | '',
      units_required: 1,
      hospital_name: '',
      hospital_location: '',
      district: 'Thrissur',
      required_date: new Date().toISOString().split('T')[0],
      urgency: 'Normal',
      additional_information: '',
    });
  };

  if (successData) {
    return (
      <div className="bg-white rounded-2xl border-2 border-red-100 p-8 md:p-12 shadow-xl text-center max-w-2xl mx-auto animate-fadeIn">
        <div className="w-20 h-20 bg-red-50 text-[#A50021] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wider mb-3">
          <Clock className="w-3.5 h-3.5" /> Request Submitted for Coordination
        </span>

        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Blood Request Received
        </h3>

        <p className="text-sm md:text-base text-gray-600 mb-6 leading-relaxed">
          The blood assistance request for <strong className="text-gray-900">{successData.patient}</strong> has been forwarded to the{' '}
          <strong>NSS RUDHIRAM</strong> blood coordination cell of Christ College (Autonomous), Irinjalakuda.
        </p>

        <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 mb-6 text-left space-y-2 text-xs md:text-sm text-gray-700">
          <div className="flex items-center justify-between pb-2 border-b border-red-200">
            <span className="text-gray-500 font-medium">Tracking Reference:</span>
            <span className="font-mono font-bold text-[#A50021]">{successData.id}</span>
          </div>
          <p className="text-gray-600 pt-1">
            Our student coordinators review requests and contact matching voluntary donors in the Irinjalakuda and Thrissur medical networks.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8 text-left text-xs text-gray-600 flex items-start gap-3">
          <Phone className="w-5 h-5 text-[#A50021] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900 mb-0.5">Emergency Coordination Notice</p>
            If this is a critical ICU / Trauma emergency, please also call our emergency helpline numbers directly:{' '}
            <strong className="text-[#A50021]">+91 94470 00000</strong> or{' '}
            <strong className="text-[#A50021]">+91 98460 00000</strong>.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[#A50021] bg-red-50 hover:bg-red-100 border border-red-200 transition"
          >
            Submit Another Request
          </button>
          <a
            href="/"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#A50021] hover:bg-[#7B0019] shadow transition"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-200 p-6 md:p-10 shadow-elevated max-w-3xl mx-auto"
      noValidate
    >
      <div className="border-b border-gray-100 pb-6 mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A50021] mb-1">
          <Droplet className="w-4 h-4 fill-[#A50021]" /> Patient Support System
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Submit a Blood Requirement Request
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          NSS Units 20 &amp; 49 assist families and hospitals in identifying voluntary donors. All request details remain strictly confidential.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {/* SECTION 1: Patient & Case Info */}
      <div className="space-y-6 mb-8">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
          <User className="w-4 h-4 text-[#A50021]" /> 1. Patient &amp; Requirement Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Patient Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Patient Full Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="patient_name"
              required
              value={formData.patient_name}
              onChange={handleChange}
              placeholder="e.g. Lakshmi Kutty Amma"
              className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                fieldErrors.patient_name
                  ? 'border-red-500 bg-red-50/30 focus:ring-red-400'
                  : 'border-gray-300 focus:ring-[#A50021]'
              }`}
            />
            {fieldErrors.patient_name && (
              <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                <span>⚠</span> {fieldErrors.patient_name}
              </p>
            )}
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Urgency Level <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Normal', 'Urgent', 'Emergency'] as RequestUrgency[]).map((level) => {
                const isSelected = formData.urgency === level;
                return (
                  <button
                    type="button"
                    key={level}
                    onClick={() => setFormData((prev) => ({ ...prev, urgency: level }))}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition ${
                      isSelected
                        ? level === 'Emergency'
                          ? 'bg-red-700 text-white border-red-800 shadow'
                          : level === 'Urgent'
                          ? 'bg-amber-600 text-white border-amber-700 shadow'
                          : 'bg-[#A50021] text-white border-[#7B0019] shadow'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Required Blood Group Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Required Blood Group <span className="text-red-600">*</span>
          </label>
          <div className={`grid grid-cols-4 sm:grid-cols-8 gap-2.5 p-1 rounded-xl ${fieldErrors.blood_group ? 'ring-2 ring-red-400 bg-red-50/20' : ''}`}>
            {BLOOD_GROUPS.map((group) => {
              const isSelected = formData.blood_group === group;
              return (
                <button
                  type="button"
                  key={group}
                  onClick={() => handleBloodGroupSelect(group)}
                  className={`py-3 rounded-xl text-base font-extrabold transition flex flex-col items-center justify-center border ${
                    isSelected
                      ? 'bg-[#A50021] text-white border-[#7B0019] shadow-md scale-105'
                      : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span>{group}</span>
                </button>
              );
            })}
          </div>
          {fieldErrors.blood_group && (
            <p className="text-xs text-red-600 mt-1.5 font-semibold flex items-center gap-1">
              <span>⚠</span> {fieldErrors.blood_group}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Units Required */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Units Required <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              name="units_required"
              min={1}
              max={20}
              required
              value={formData.units_required}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A50021] focus:border-transparent text-sm text-gray-900"
            />
          </div>

          {/* Required Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Required Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              name="required_date"
              min={new Date().toISOString().split('T')[0]}
              required
              value={formData.required_date}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A50021] focus:border-transparent text-sm text-gray-900 bg-white"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Hospital & Location */}
      <div className="space-y-6 mb-8">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
          <Building2 className="w-4 h-4 text-[#A50021]" /> 2. Hospital &amp; Medical Centre Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Hospital Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Hospital / Blood Bank Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="hospital_name"
              required
              value={formData.hospital_name}
              onChange={handleChange}
              placeholder="e.g. Taluk Hospital Irinjalakuda / Jubilee Mission Thrissur"
              className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                fieldErrors.hospital_name
                  ? 'border-red-500 bg-red-50/30 focus:ring-red-400'
                  : 'border-gray-300 focus:ring-[#A50021]'
              }`}
            />
            {fieldErrors.hospital_name && (
              <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                <span>⚠</span> {fieldErrors.hospital_name}
              </p>
            )}
          </div>

          {/* District */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              District <span className="text-red-600">*</span>
            </label>
            <select
              name="district"
              required
              value={formData.district}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A50021] focus:border-transparent text-sm text-gray-900 bg-white"
            >
              {KERALA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Hospital Location */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Hospital Location / Area <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="hospital_location"
              required
              value={formData.hospital_location}
              onChange={handleChange}
              placeholder="e.g. Irinjalakuda Town, Thrissur"
              className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                fieldErrors.hospital_location
                  ? 'border-red-500 bg-red-50/30 focus:ring-red-400'
                  : 'border-gray-300 focus:ring-[#A50021]'
              }`}
            />
            {fieldErrors.hospital_location && (
              <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                <span>⚠</span> {fieldErrors.hospital_location}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: Contact Person */}
      <div className="space-y-6 mb-8">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
          <Phone className="w-4 h-4 text-[#A50021]" /> 3. Contact Person &amp; Attender Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Contact Person Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Contact Person Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="contact_person"
              required
              value={formData.contact_person}
              onChange={handleChange}
              placeholder="e.g. Ramesh K. (Brother / Attender)"
              className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                fieldErrors.contact_person
                  ? 'border-red-500 bg-red-50/30 focus:ring-red-400'
                  : 'border-gray-300 focus:ring-[#A50021]'
              }`}
            />
            {fieldErrors.contact_person && (
              <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                <span>⚠</span> {fieldErrors.contact_person}
              </p>
            )}
          </div>

          {/* Contact Mobile */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Contact Mobile Number <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-semibold text-gray-500">
                +91
              </span>
              <input
                type="tel"
                name="contact_number"
                maxLength={10}
                required
                value={formData.contact_number}
                onChange={handleChange}
                placeholder="9847998877"
                className={`w-full pl-12 pr-4 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  fieldErrors.contact_number
                    ? 'border-red-500 bg-red-50/30 focus:ring-red-400'
                    : 'border-gray-300 focus:ring-[#A50021]'
                }`}
              />
            </div>
            {fieldErrors.contact_number && (
              <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                <span>⚠</span> {fieldErrors.contact_number}
              </p>
            )}
          </div>

          {/* Additional Info */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Medical / Surgery Notes{' '}
              <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              name="additional_information"
              rows={2}
              value={formData.additional_information}
              onChange={handleChange}
              placeholder="e.g. Scheduled for knee surgery at 10 AM, bypass, chemotherapy platelet need, etc."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A50021] focus:border-transparent text-sm text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Privacy Guarantee Notice */}
      <div className="mb-8 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-start gap-3">
        <Shield className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-gray-900">Patient Data Privacy Notice:</strong> Patient and request details are stored securely and never published publicly. Only authorised NSS administrators review this submission to coordinate matching voluntary donors.
        </div>
      </div>

      {/* Submit Action */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-[#A50021] hover:bg-[#7B0019] focus:outline-none focus:ring-4 focus:ring-red-200 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-base disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Submitting Blood Request...</span>
          </>
        ) : (
          <>
            <Droplet className="w-5 h-5 fill-white" />
            <span>SUBMIT BLOOD ASSISTANCE REQUEST</span>
          </>
        )}
      </button>
    </form>
  );
}
