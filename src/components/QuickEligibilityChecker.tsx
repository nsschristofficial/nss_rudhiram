'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Clock, Heart, ArrowRight } from 'lucide-react';

export default function QuickEligibilityChecker() {
  const [ageGroup, setAgeGroup] = useState<'valid' | 'young' | 'old'>('valid');
  const [weightGroup, setWeightGroup] = useState<'valid' | 'under'>('valid');
  const [lastDonation, setLastDonation] = useState<'never' | 'eligible' | 'recent'>('never');

  const isEligible = ageGroup === 'valid' && weightGroup === 'valid' && lastDonation !== 'recent';

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-card space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#A50021]">
            Quick Medical Self-Assessment
          </span>
          <h3 className="text-xl font-bold text-gray-900 mt-0.5">
            Can I Donate Blood Today?
          </h3>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#A50021] flex items-center justify-center font-bold">
          <Heart className="w-5 h-5 fill-[#A50021]" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
        {/* Q1: Age */}
        <div className="space-y-2">
          <label className="font-bold text-gray-800 block">1. What is your age?</label>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => setAgeGroup('valid')}
              className={`w-full py-2 px-3 rounded-xl font-semibold text-left transition border ${
                ageGroup === 'valid'
                  ? 'bg-red-50 text-[#A50021] border-[#A50021]'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              ✓ Between 18 and 65 years
            </button>
            <button
              type="button"
              onClick={() => setAgeGroup('young')}
              className={`w-full py-2 px-3 rounded-xl font-semibold text-left transition border ${
                ageGroup === 'young'
                  ? 'bg-red-50 text-[#A50021] border-[#A50021]'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              Under 18 years
            </button>
          </div>
        </div>

        {/* Q2: Weight */}
        <div className="space-y-2">
          <label className="font-bold text-gray-800 block">2. What is your body weight?</label>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => setWeightGroup('valid')}
              className={`w-full py-2 px-3 rounded-xl font-semibold text-left transition border ${
                weightGroup === 'valid'
                  ? 'bg-red-50 text-[#A50021] border-[#A50021]'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              ✓ 45 kg or above
            </button>
            <button
              type="button"
              onClick={() => setWeightGroup('under')}
              className={`w-full py-2 px-3 rounded-xl font-semibold text-left transition border ${
                weightGroup === 'under'
                  ? 'bg-red-50 text-[#A50021] border-[#A50021]'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              Under 45 kg
            </button>
          </div>
        </div>

        {/* Q3: Interval */}
        <div className="space-y-2">
          <label className="font-bold text-gray-800 block">3. When did you last donate?</label>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => setLastDonation('never')}
              className={`w-full py-2 px-3 rounded-xl font-semibold text-left transition border ${
                lastDonation === 'never' || lastDonation === 'eligible'
                  ? 'bg-red-50 text-[#A50021] border-[#A50021]'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              ✓ Never / &gt; 90 days ago
            </button>
            <button
              type="button"
              onClick={() => setLastDonation('recent')}
              className={`w-full py-2 px-3 rounded-xl font-semibold text-left transition border ${
                lastDonation === 'recent'
                  ? 'bg-red-50 text-[#A50021] border-[#A50021]'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              Within the last 3 months
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Assessment Result Box */}
      <div className="pt-2">
        {isEligible ? (
          <div className="p-4 rounded-2xl bg-green-50 border border-green-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-green-950">
                  Great! You Meet the General Voluntary Donor Criteria
                </h4>
                <p className="text-xs text-green-800">
                  You are ready to register as a voluntary blood donor with NSS Christ College.
                </p>
              </div>
            </div>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#A50021] hover:bg-[#7B0019] shadow transition flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <span>Register Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : lastDonation === 'recent' ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-900 animate-fadeIn">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <strong className="font-bold">Almost there!</strong> Indian transfusion regulations require a mandatory 90-day recovery gap between whole blood donations. You can still register so we can contact you once your interval is complete!
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-xs text-red-800 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <strong className="font-bold">Eligibility criteria:</strong> Donors must be at least 18 years of age and weigh 45 kg or more for their own safety.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
