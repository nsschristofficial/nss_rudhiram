'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { BloodGroup, AvailabilityStatus } from '@/types';
import { BLOOD_GROUPS, KERALA_DISTRICTS } from '@/lib/constants';
import { isValidIndianMobile, isEligibleByDate, daysSince } from '@/lib/utils';
import {
  Heart,
  Droplet,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  HelpCircle,
  FileText,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function DonorRegistrationForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: 'Prefer not to say',
    blood_group: '' as BloodGroup | '',
    mobile: '',
    email: '',
    district: 'Thrissur', // default primary district for Christ College Irinjalakuda
    locality: '',
    pincode: '',
    last_donation_date: '',
    availability: 'Available' as AvailabilityStatus,
    additional_information: '',
    consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ id: string; name: string } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errorMsg) setErrorMsg(null);
  };

  const handleBloodGroupSelect = (group: BloodGroup) => {
    setFormData((prev) => ({ ...prev, blood_group: group }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Client-Side Validation
    if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
      setErrorMsg('Please enter your full name (minimum 2 characters).');
      return;
    }

    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 18) {
      setErrorMsg('You must be at least 18 years old to register as a voluntary blood donor.');
      return;
    }
    if (ageNum > 65) {
      setErrorMsg('The maximum eligible age for blood donor registration is 65 years.');
      return;
    }

    if (!formData.blood_group) {
      setErrorMsg('Please select your blood group.');
      return;
    }

    if (!isValidIndianMobile(formData.mobile)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (e.g., 9847123456).');
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrorMsg('Please enter a valid email address or leave it blank.');
      return;
    }

    if (!formData.district) {
      setErrorMsg('Please select your district.');
      return;
    }

    if (!formData.locality.trim() || formData.locality.trim().length < 2) {
      setErrorMsg('Please enter your place or locality name.');
      return;
    }

    const cleanPin = formData.pincode.replace(/[^0-9]/g, '');
    if (cleanPin.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit postal PIN code.');
      return;
    }

    if (formData.last_donation_date) {
      const d = new Date(formData.last_donation_date);
      if (d > new Date()) {
        setErrorMsg('Last donation date cannot be in the future.');
        return;
      }
    }

    if (!formData.consent) {
      setErrorMsg('You must agree to the voluntary consent statement to register.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/donors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          age: ageNum,
          pincode: cleanPin,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to submit registration.');
      }

      // Success Celebration!
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#A50021', '#E02446', '#FFD700', '#1B3B8A'],
        });
      } catch {}

      setSuccessData({
        id: resData.registrationId || 'CONFIRMED',
        name: formData.full_name,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong while submitting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setFormData({
      full_name: '',
      age: '',
      gender: 'Prefer not to say',
      blood_group: '' as BloodGroup | '',
      mobile: '',
      email: '',
      district: 'Thrissur',
      locality: '',
      pincode: '',
      last_donation_date: '',
      availability: 'Available',
      additional_information: '',
      consent: false,
    });
  };

  if (successData) {
    return (
      <div className="bg-white rounded-2xl border-2 border-red-100 p-8 md:p-12 shadow-xl text-center max-w-2xl mx-auto animate-fadeIn">
        <div className="w-20 h-20 bg-red-50 text-[#A50021] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Registration Confirmed
        </span>

        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Thank You, {successData.name}!
        </h3>

        <p className="text-sm md:text-base text-gray-600 mb-6 leading-relaxed">
          Your voluntary blood donor registration has been securely recorded with the{' '}
          <strong className="text-gray-900">NSS RUDHIRAM</strong> team of Christ College (Autonomous), Irinjalakuda.
        </p>

        <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 mb-6 text-left space-y-2 text-xs md:text-sm text-gray-700">
          <div className="flex items-center justify-between pb-2 border-b border-red-200">
            <span className="text-gray-500 font-medium">Registration Reference ID:</span>
            <span className="font-mono font-bold text-[#A50021]">{successData.id}</span>
          </div>
          <p className="text-gray-600 leading-relaxed pt-1">
            <strong className="text-gray-900">Confidentiality Guarantee:</strong> Your contact information is never displayed publicly. Only verified NSS coordinators access your profile during blood donation emergencies.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left text-xs text-amber-800 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 mb-1">Medical Eligibility Reminder</p>
            Registration does not guarantee eligibility to donate blood. Final clinical eligibility (haemoglobin count, blood pressure, health history) will be determined by qualified medical professionals according to national blood transfusion guidelines at the time of donation.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[#A50021] bg-red-50 hover:bg-red-100 border border-red-200 transition"
          >
            Register Another Donor
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
          <Droplet className="w-4 h-4 fill-[#A50021]" /> Voluntary Donor Portal
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Register as a Voluntary Blood Donor
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Join the NSS Christ College donor network. Your voluntary gesture can save someone&apos;s life in an emergency.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {/* SECTION 1: Personal & Contact */}
      <div className="space-y-6 mb-8">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
          <User className="w-4 h-4 text-[#A50021]" /> 1. Personal &amp; Contact Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g. Abhiram K. S."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A50021] focus:border-transparent text-sm text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Age (Years) <span className="text-red-600">*</span>
              <span className="text-[11px] font-normal text-gray-500 lowercase ml-1">
                (Must be 18 to 65)
              </span>
            </label>
            <input
              type="number"
              name="age"
              min={18}
              max={65}
              required
              value={formData.age}
              onChange={handleChange}
              placeholder="18"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A50021] focus:border-transparent text-sm text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Gender <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A50021] focus:border-transparent text-sm text-gray-900 bg-white"
            >
              <option value="Prefer not to say">Prefer not to say</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Mobile Number <span className="text-red-600">*</span>
              <span className="text-[11px] font-normal text-gray-500 lowercase ml-1">
                (10 digits)
              </span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-semibold text-gray-500">
                +91
              </span>
              <input
                type="tel"
                name="mobile"
                maxLength={10}
                required
                value={formData.mobile}
                onChange={handleChange}
                placeholder="9847123456"
                className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A50021] focus:border-transparent text-sm text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Email Address <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. name@christcollegeijk.edu.in"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A50021] focus:border-transparent text-sm text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Blood Group & Donation History */}
      <div className="space-y-6 mb-8">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
          <Droplet className="w-4 h-4 text-[#A50021]" /> 2. Blood Group &amp; Donation Details
        </h3>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Select Your Blood Group <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Last Donation Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Last Blood Donation Date{' '}
              <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="last_donation_date"
                max={new Date().toISOString().split('T')[0]}
                value={formData.last_donation_date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A50021] focus:border-transparent text-sm text-gray-900 bg-white"
              />
            </div>
            {formData.last_donation_date && (
              <div className="mt-1 text-xs">
                {isEligibleByDate(formData.last_donation_date) ? (
                  <span className="text-green-700 font-medium">
                    ✓ {daysSince(formData.last_donation_date)} days ago (Eligible for donation)
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">
                    ⓘ {daysSince(formData.last_donation_date)} days ago (Minimum 90 days required between whole blood donations)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Current Availability */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Availability Status <span className="text-red-600">*</span>
            </label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A50021] focus:border-transparent text-sm text-gray-900 bg-white"
            >
              <option value="Available">Available (Ready to donate on requirement)</option>
              <option value="Busy">Temporarily Busy / Travelling</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: Location Details */}
      <div className="space-y-6 mb-8">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
          <MapPin className="w-4 h-4 text-[#A50021]" /> 3. Residential Location
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
              {KERALA_DISTRICTS.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Place / Locality */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Place / Locality <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="locality"
              required
              value={formData.locality}
              onChange={handleChange}
              placeholder="e.g. Irinjalakuda, Kodakara, Chalakudy"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A50021] focus:border-transparent text-sm text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* PIN Code */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              PIN Code <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="pincode"
              maxLength={6}
              required
              value={formData.pincode}
              onChange={handleChange}
              placeholder="680121"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A50021] focus:border-transparent text-sm text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Additional Info */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Additional Information{' '}
            <span className="text-gray-400 font-normal lowercase">
              (e.g., student batch, department, preferred call timings)
            </span>
          </label>
          <textarea
            name="additional_information"
            rows={2}
            value={formData.additional_information}
            onChange={handleChange}
            placeholder="e.g., NSS Unit 20 volunteer, Christ College Irinjalakuda, Department of Physics"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A50021] focus:border-transparent text-sm text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {/* SECTION 4: Mandatory Voluntary Consent & Medical Notice */}
      <div className="space-y-4 mb-8 pt-4 border-t border-gray-100">
        <div className="bg-red-50/60 border border-red-200 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="consent"
              required
              checked={formData.consent}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-[#A50021] border-gray-300 rounded focus:ring-[#A50021] cursor-pointer"
            />
            <span className="text-xs text-gray-800 leading-relaxed font-medium">
              &ldquo;I voluntarily agree to provide my information to the NSS RUDHIRAM team for blood donation coordination. I understand that my information will be securely stored and accessed only by authorised administrators for this purpose.&rdquo;{' '}
              <span className="text-red-600 font-bold">*</span>
            </span>
          </label>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-gray-700">Medical Guideline:</strong> Registration does not guarantee eligibility to donate blood. Final eligibility is determined by qualified medical professionals according to applicable medical guidelines and laboratory blood screening.
          </p>
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-[#A50021] hover:bg-[#7B0019] focus:outline-none focus:ring-4 focus:ring-red-200 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-base disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Registering Voluntary Donor...</span>
            </>
          ) : (
            <>
              <Heart className="w-5 h-5 fill-white" />
              <span>CONFIRM &amp; REGISTER AS VOLUNTARY DONOR</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
