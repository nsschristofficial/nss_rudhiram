import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  Heart,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Coffee,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works & Eligibility Guidelines | RUDHIRAM – NSS Christ College Irinjalakuda',
  description: 'Understand the blood coordination workflow and national medical eligibility criteria for voluntary blood donation under NSS Christ College.',
};

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1 bg-white">
        {/* Banner */}
        <section className="bg-gradient-to-b from-red-50 to-white py-12 px-4 sm:px-6 lg:px-8 border-b border-gray-100 text-center">
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A50021]">
              Standards &amp; Criteria
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Donation Guidelines &amp; Protocol
            </h1>
            <p className="text-sm text-gray-600 max-w-xl mx-auto">
              Everything you need to know about voluntary donor eligibility, pre-donation preparation, and how requests are coordinated.
            </p>
          </div>
        </section>

        <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Two Pathways */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-50/50 rounded-3xl p-6 border border-red-100 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#A50021] text-white flex items-center justify-center shadow-xs">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">For Voluntary Donors</h3>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#A50021]">1.</span> Register blood group, locality, and mobile number.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#A50021]">2.</span> Data is stored under strict Row Level Security.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#A50021]">3.</span> Coordinators call or WhatsApp during urgent local cases.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#A50021]">4.</span> Donate directly at the licensed hospital blood bank.
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A50021] hover:underline"
                >
                  Register as Donor <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-800 text-white flex items-center justify-center shadow-xs">
                <Droplet className="w-5 h-5 fill-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">For Patients &amp; Requesters</h3>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-gray-800">1.</span> Submit patient name, required group, units, and hospital.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-gray-800">2.</span> Coordinators review urgency (Emergency, Urgent, Normal).
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-gray-800">3.</span> Match compatible voluntary donors in the area.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-gray-800">4.</span> Donors report to blood bank to donate for the patient.
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/request"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-900 hover:underline"
                >
                  Submit Request <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Eligibility Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Medical Donor Eligibility Standards</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> Age &amp; Weight
                </span>
                <p className="text-gray-600">Aged 18–65 years and minimum body weight of 45 kg.</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> Haemoglobin Level
                </span>
                <p className="text-gray-600">Minimum haemoglobin of 12.5 g/dL (checked on-site free of charge).</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> Donation Gap
                </span>
                <p className="text-gray-600">Minimum 90 days (3 months) since previous whole blood donation.</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> Vital Signs
                </span>
                <p className="text-gray-600">Normal pulse (60–100 bpm) and blood pressure (100–140 / 60–90).</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Temporary Gap
                </span>
                <p className="text-gray-600">Recent tattoos (6 months); dental extraction or fever (14 days).</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Deferrals
                </span>
                <p className="text-gray-600">Chronic cardiovascular, renal, Hepatitis B/C, or HIV conditions.</p>
              </div>
            </div>
          </div>

          {/* Quick Pre/Post Tips */}
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-[#A50021]" /> Pre-Donation &amp; Post-Donation Care
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
              <ul className="space-y-1 list-disc pl-4">
                <li>Drink 2 extra glasses of water before donation.</li>
                <li>Have a wholesome light meal 2–3 hours before donating.</li>
              </ul>
              <ul className="space-y-1 list-disc pl-4">
                <li>Rest 10–15 minutes after donation and take light refreshments.</li>
                <li>Avoid heavy gym workouts or lifting for the rest of the day.</li>
              </ul>
            </div>
          </div>

          {/* Medical Notice */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-gray-700 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#A50021] flex-shrink-0 mt-0.5" />
            <p>
              <strong>Medical Disclaimer:</strong> Portal registration does not determine clinical compatibility. Final cross-matching and donor fitness are determined exclusively by qualified medical professionals at the hospital blood bank.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
