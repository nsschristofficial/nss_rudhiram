'use client';

import React, { useState } from 'react';
import { Droplet, Heart, Sparkles, Activity, ShieldCheck, Users } from 'lucide-react';

export default function InteractiveImpactCalculator() {
  const [donorCount, setDonorCount] = useState<number>(3);

  const livesSaved = donorCount * 3;
  const bloodVolumeMl = donorCount * 350;
  const plateletUnits = donorCount * 1;
  const plasmaMl = donorCount * 150;

  return (
    <div className="bg-gradient-to-br from-red-50/70 via-white to-gray-50 rounded-3xl border border-red-100 p-6 sm:p-8 shadow-card relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-100/50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-[#A50021] border border-red-200 shadow-2xs mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Impact Simulator
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              See the Ripple Effect of Voluntary Donors
            </h3>
            <p className="text-xs text-gray-600">
              Drag the slider to visualize how NSS voluntary blood donors transform patient outcomes.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-red-200 shadow-sm flex-shrink-0">
            <Users className="w-4 h-4 text-[#A50021]" />
            <span className="text-xs font-bold text-gray-600">Active Donors:</span>
            <span className="text-xl font-black text-[#A50021]">{donorCount}</span>
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-bold text-gray-700">
            <span>1 Voluntary Donor</span>
            <span className="text-[#A50021]">Select Donors: {donorCount}</span>
            <span>15 Donors</span>
          </div>
          <input
            type="range"
            min={1}
            max={15}
            value={donorCount}
            onChange={(e) => setDonorCount(parseInt(e.target.value, 10))}
            className="w-full h-2.5 bg-gray-200 rounded-lg cursor-pointer transition"
          />
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Lives Touched */}
          <div className="bg-white p-4 rounded-2xl border border-red-200/80 shadow-sm text-center space-y-1 transform hover:scale-[1.02] transition">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#A50021] flex items-center justify-center mx-auto mb-1">
              <Heart className="w-4 h-4 fill-[#A50021]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#A50021] tracking-tight">
              Up to {livesSaved}
            </div>
            <div className="text-[11px] font-bold text-gray-800">Lives Touched</div>
            <p className="text-[10px] text-gray-500">Trauma &amp; surgery patients</p>
          </div>

          {/* Whole Blood Volume */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center space-y-1 transform hover:scale-[1.02] transition">
            <div className="w-8 h-8 rounded-xl bg-gray-50 text-gray-800 flex items-center justify-center mx-auto mb-1">
              <Droplet className="w-4 h-4 fill-[#A50021]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {bloodVolumeMl} ml
            </div>
            <div className="text-[11px] font-bold text-gray-800">Packed RBCs</div>
            <p className="text-[10px] text-gray-500">Haemoglobin restoration</p>
          </div>

          {/* Platelets */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center space-y-1 transform hover:scale-[1.02] transition">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-1">
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {plateletUnits} Units
            </div>
            <div className="text-[11px] font-bold text-gray-800">Platelet Concentrates</div>
            <p className="text-[10px] text-gray-500">Oncology &amp; dengue support</p>
          </div>

          {/* Fresh Frozen Plasma */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center space-y-1 transform hover:scale-[1.02] transition">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-1">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {plasmaMl} ml
            </div>
            <div className="text-[11px] font-bold text-gray-800">Fresh Frozen Plasma</div>
            <p className="text-[10px] text-gray-500">Burn care &amp; clotting factors</p>
          </div>
        </div>
      </div>
    </div>
  );
}
