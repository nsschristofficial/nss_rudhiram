'use client';

import React, { useState } from 'react';
import { BloodGroup } from '@/types';
import { BLOOD_GROUPS, BLOOD_COMPATIBILITY, BLOOD_DONOR_TARGETS } from '@/lib/constants';
import { Check, X, Info } from 'lucide-react';

export default function CompatibilityMatrix() {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O+');

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 p-6 md:p-8 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#A50021]">
            Medical Knowledge Base
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
            Blood Compatibility Guide
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Instant compatibility checker for patient and donor blood groups
          </p>
        </div>

        {/* Blood Group Selector Chips */}
        <div className="flex flex-wrap gap-1.5">
          {BLOOD_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedGroup === group
                  ? 'bg-[#A50021] text-white shadow-md scale-105'
                  : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Detail Analysis for Selected Group */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        {/* Can Receive From */}
        <div className="bg-red-50/60 rounded-xl p-5 border border-red-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-[#A50021] text-white font-bold flex items-center justify-center text-sm shadow">
              {selectedGroup}
            </span>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                Can Receive Blood From:
              </h4>
              <p className="text-xs text-gray-500">Compatible donors for {selectedGroup}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {BLOOD_COMPATIBILITY[selectedGroup].map((donorGrp) => (
              <span
                key={donorGrp}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-white text-[#A50021] border border-red-200 shadow-sm"
              >
                <Check className="w-3.5 h-3.5 text-green-600 stroke-[3]" />
                {donorGrp}
              </span>
            ))}
          </div>
          {selectedGroup === 'AB+' && (
            <p className="text-xs text-[#A50021] font-semibold mt-3">
              ★ Universal Recipient: AB+ patients can receive red blood cells from any blood group.
            </p>
          )}
        </div>

        {/* Can Donate To */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-gray-800 text-white font-bold flex items-center justify-center text-sm shadow">
              {selectedGroup}
            </span>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                Can Donate Blood To:
              </h4>
              <p className="text-xs text-gray-500">Patients that {selectedGroup} can help</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {BLOOD_DONOR_TARGETS[selectedGroup].map((recGrp) => (
              <span
                key={recGrp}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-white text-gray-800 border border-gray-200 shadow-sm"
              >
                <Check className="w-3.5 h-3.5 text-green-600 stroke-[3]" />
                {recGrp}
              </span>
            ))}
          </div>
          {selectedGroup === 'O-' && (
            <p className="text-xs text-[#A50021] font-semibold mt-3">
              ★ Universal Red Blood Cell Donor: O- red blood cells can be safely transfused to all patients in emergencies!
            </p>
          )}
        </div>
      </div>

      {/* Grid Comparison Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 font-bold">
              <th className="p-2.5 text-left border border-gray-200">Recipient Blood Group</th>
              {BLOOD_GROUPS.map((g) => (
                <th key={g} className="p-2 border border-gray-200">
                  {g}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BLOOD_GROUPS.map((rec) => (
              <tr key={rec} className={rec === selectedGroup ? 'bg-red-50/70 font-semibold' : 'hover:bg-gray-50'}>
                <td className="p-2.5 text-left font-bold border border-gray-200 text-gray-900">
                  {rec}
                </td>
                {BLOOD_GROUPS.map((don) => {
                  const compatible = BLOOD_COMPATIBILITY[rec].includes(don);
                  return (
                    <td key={don} className="p-2 border border-gray-200">
                      {compatible ? (
                        <span className="inline-block w-5 h-5 rounded-full bg-green-100 text-green-700 leading-5 mx-auto">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-block text-gray-300">
                          —
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold text-gray-700">Important Medical Note:</span> This chart describes red blood cell compatibility rules. Final cross-matching, antibody screening, and medical donor clearance must be performed in-person by licensed hospital blood bank pathologists before any transfusion.
        </p>
      </div>
    </div>
  );
}
