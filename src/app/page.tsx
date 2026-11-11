import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CompatibilityMatrix from '@/components/CompatibilityMatrix';
import InteractiveImpactCalculator from '@/components/InteractiveImpactCalculator';
import QuickEligibilityChecker from '@/components/QuickEligibilityChecker';
import { INSTITUTION_INFO } from '@/lib/constants';
import {
  Heart,
  Droplet,
  Shield,
  Activity,
  ArrowRight,
  HeartHandshake,
  Sparkles,
  Phone,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="flex-1 bg-white overflow-hidden">
        {/* HERO SECTION: Fluid, Curvy & Premium Award-Winning Feel */}
        <section className="relative pt-10 pb-20 lg:pt-16 lg:pb-28">
          {/* Organic Background Blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[580px] pointer-events-none -z-10 overflow-hidden">
            <div className="absolute -top-32 left-1/4 w-[520px] h-[520px] bg-gradient-to-br from-rose-200/40 via-red-100/30 to-transparent rounded-full blur-3xl animate-ambient-wave" />
            <div className="absolute top-20 right-10 w-[420px] h-[420px] bg-gradient-to-bl from-amber-100/30 via-red-50/40 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto space-y-7">
              {/* Floating Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/90 border border-red-200/80 shadow-xs backdrop-blur-md text-[11px] sm:text-xs font-bold text-[#A50021] hover:shadow-md transition max-w-full text-center">
                <span className="flex h-2 w-2 relative flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A50021]"></span>
                </span>
                <span className="leading-snug">NSS Units 20 &amp; 49 • Christ College (Autonomous), Irinjalakuda</span>
              </div>

              {/* Title & Tagline with Fluid Elegance */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-gray-950 leading-[1.1] sm:leading-[1.08] break-words">
                  Every Drop Holds A <span className="text-[#A50021] relative inline-block">
                    Heartbeat
                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-red-200/80 -z-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <path d="M0,15 Q50,0 100,15" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
                    </svg>
                  </span>
                </h1>

                <p className="text-base sm:text-xl font-bold tracking-wide text-gray-800 uppercase">
                  RUDHIRAM – A Centralised Blood Donor Portal
                </p>

                <p className="text-sm sm:text-base font-semibold text-[#85001a] tracking-wider uppercase max-w-2xl mx-auto italic">
                  &ldquo;{INSTITUTION_INFO.tagline}&rdquo;
                </p>

                <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed pt-1">
                  A modern, compassionate network by student volunteers linking willing blood donors directly with emergency patients across Central Kerala.
                </p>
              </div>

              {/* Primary Floating Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-white bg-[#A50021] hover:bg-[#82001a] shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 text-sm group"
                >
                  <Heart className="w-4 h-4 fill-white group-hover:scale-125 transition" />
                  <span>REGISTER AS A DONOR</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>

                <Link
                  href="/request"
                  className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-gray-800 bg-white hover:bg-rose-50/60 border border-gray-200/90 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 text-sm"
                >
                  <Droplet className="w-4 h-4 fill-[#A50021] text-[#A50021]" />
                  <span>REQUEST BLOOD</span>
                </Link>
              </div>

              {/* Direct Coordinator Call Line */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
                <span className="font-medium">Direct Volunteer Helplines:</span>
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <a href="tel:+917907178135" className="hover:text-[#A50021] transition">Krishna Priya (+91 7907178135)</a>
                  <span>•</span>
                  <a href="tel:+919746371985" className="hover:text-[#A50021] transition">Alex (+91 9746371985)</a>
                </div>
              </div>
            </div>

            {/* Curvy Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
              <div className="bg-gradient-to-b from-white to-gray-50/60 p-6 rounded-3xl border border-gray-200/70 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#A50021] flex items-center justify-center shadow-inner">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  100% Voluntary Coordination
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Operated completely by NSS student volunteers under the motto &apos;Not Me, But You&apos;.
                </p>
              </div>

              <div className="bg-gradient-to-b from-white to-gray-50/60 p-6 rounded-3xl border border-gray-200/70 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#A50021] flex items-center justify-center shadow-inner">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Private &amp; Confidential
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Donor phone numbers and patient details are kept confidential and accessed solely by authorised NSS officers.
                </p>
              </div>

              <div className="bg-gradient-to-b from-white to-gray-50/60 p-6 rounded-3xl border border-gray-200/70 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#A50021] flex items-center justify-center shadow-inner">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Swift Hospital Assistance
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Fast coordination with taluk hospitals and medical centres across Irinjalakuda and Thrissur.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE ELIGIBILITY CHECKER */}
        <section className="py-14 bg-gradient-to-b from-white via-rose-50/20 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <QuickEligibilityChecker />
          </div>
        </section>

        {/* INTERACTIVE DONOR IMPACT CALCULATOR */}
        <section className="py-14 bg-gray-50/80 border-t border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <InteractiveImpactCalculator />
          </div>
        </section>

        {/* HOW THE PORTAL WORKS: Fluid flowing cards */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#A50021]">
                Simple &amp; Seamless
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950">
                How RUDHIRAM Works
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="relative bg-white p-6 rounded-3xl border border-gray-200/70 shadow-xs hover:shadow-md transition space-y-3">
                <span className="w-8 h-8 rounded-full bg-red-100 text-[#A50021] font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h4 className="text-base font-bold text-gray-900">Pledge or Request</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Volunteers register their blood group; patients submit urgent hospital requirements.
                </p>
              </div>

              <div className="relative bg-white p-6 rounded-3xl border border-gray-200/70 shadow-xs hover:shadow-md transition space-y-3">
                <span className="w-8 h-8 rounded-full bg-red-100 text-[#A50021] font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h4 className="text-base font-bold text-gray-900">Encrypted Registry</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Records are held securely under strict administrative authorization protocols.
                </p>
              </div>

              <div className="relative bg-white p-6 rounded-3xl border border-gray-200/70 shadow-xs hover:shadow-md transition space-y-3">
                <span className="w-8 h-8 rounded-full bg-red-100 text-[#A50021] font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <h4 className="text-base font-bold text-gray-900">Smart Compatibility</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  NSS officers match compatible blood groups in the donor’s immediate locality.
                </p>
              </div>

              <div className="relative bg-white p-6 rounded-3xl border border-gray-200/70 shadow-xs hover:shadow-md transition space-y-3">
                <span className="w-8 h-8 rounded-full bg-red-100 text-[#A50021] font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <h4 className="text-base font-bold text-gray-900">Hospital Donation</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Donors report to the accredited hospital blood bank to complete the life-saving donation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BLOOD COMPATIBILITY MATRIX */}
        <section className="py-14 bg-gray-50/70 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CompatibilityMatrix />
          </div>
        </section>

        {/* FLOATING ACTION BANNER */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-[#85001a] via-[#A50021] to-[#600013] text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center space-y-5">
            <div className="relative z-10 space-y-3">
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                Urgent Blood Requirement in Central Kerala?
              </h2>
              <p className="text-rose-100 text-xs sm:text-sm max-w-xl mx-auto">
                Submit an online request or call our student coordinators directly for immediate assistance.
              </p>
              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/request"
                  className="px-6 py-3 rounded-full font-bold bg-white text-[#A50021] hover:bg-rose-50 shadow-lg hover:scale-105 active:scale-95 transition text-xs"
                >
                  SUBMIT BLOOD REQUEST
                </Link>
                <a
                  href="tel:+917907178135"
                  className="px-6 py-3 rounded-full font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition text-xs flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Krishna Priya: +91 7907178135
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
