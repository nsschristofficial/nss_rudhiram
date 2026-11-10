import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { INSTITUTION_INFO } from '@/lib/constants';
import { Award, Heart, Shield, Users, CheckCircle2, Droplet, ArrowRight, Sparkles } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About RUDHIRAM | NSS Units 20 & 49, Christ College (Autonomous), Irinjalakuda',
  description: 'Learn about the RUDHIRAM blood donation coordination initiative by National Service Scheme (NSS Units 20 & 49) of Christ College (Autonomous), Irinjalakuda, University of Calicut.',
};

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1 bg-white">
        {/* Banner */}
        <section className="bg-gradient-to-b from-red-50 to-white py-12 px-4 sm:px-6 lg:px-8 border-b border-gray-100 text-center">
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A50021]">
              Institutional Initiative
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              About RUDHIRAM
            </h1>
            <p className="text-sm text-gray-600 max-w-xl mx-auto">
              A Centralised Blood Donor Portal developed by NSS Units 20 &amp; 49 of Christ College (Autonomous), Irinjalakuda (University of Calicut).
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Institutional Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A50021]">
                Heritage of Service
              </span>
              <h2 className="text-2xl font-black text-gray-900">
                Christ College (Autonomous), Irinjalakuda
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Founded in 1956 and autonomous since 2015, Christ College is accredited with a premier <strong className="text-gray-900">&apos;A++&apos; Grade by NAAC</strong>. Under the motto <em className="text-gray-900">&ldquo;Jeeva Prabha&rdquo; (Life and Light)</em>, the institution champions civic service alongside academic excellence.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Accreditation</span>
                  <span className="font-extrabold text-gray-900">NAAC &apos;A++&apos; Grade</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Affiliation</span>
                  <span className="font-extrabold text-gray-900">University of Calicut</span>
                </div>
              </div>
            </div>

            {/* Crest Card */}
            <div className="bg-gradient-to-br from-red-50/60 to-gray-50 rounded-3xl p-6 border border-red-100 shadow-card space-y-5 text-center">
              <div className="flex items-center justify-center gap-5">
                <div className="relative w-24 h-24 bg-white rounded-full p-2 shadow-md border border-gray-200">
                  <Image
                    src="/images/christ-college-logo.jpg"
                    alt="Christ College Crest"
                    fill
                    className="object-contain p-2"
                    sizes="96px"
                  />
                </div>
                <div className="relative w-24 h-24 bg-white rounded-full p-2 shadow-md border border-gray-200">
                  <Image
                    src="/images/nss-logo.png"
                    alt="NSS Emblem"
                    fill
                    className="object-contain p-2"
                    sizes="96px"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase">
                  National Service Scheme (Units 20 &amp; 49)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Motto: &ldquo;Not Me, But You&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Mission of Rudhiram */}
          <div className="bg-red-50/60 border border-red-200 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Droplet className="w-5 h-5 fill-[#A50021] text-[#A50021]" /> The Vision of RUDHIRAM
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              In Malayalam and Sanskrit, <strong className="text-[#A50021]">RUDHIRAM (രുധിരം)</strong> represents blood — the vital essence of life.
            </p>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              When emergencies strike, families often scramble through unverified social media lists with outdated contact numbers. RUDHIRAM eliminates this panic by maintaining a secure, verified institutional directory accessible to NSS coordinators who swiftly match compatible donors with local hospital requisitions.
            </p>
            <div className="pt-1">
              <blockquote className="border-l-4 border-[#A50021] pl-4 italic text-xs sm:text-sm text-[#7B0019] font-bold">
                &ldquo;{INSTITUTION_INFO.tagline}&rdquo;
              </blockquote>
            </div>
          </div>

          {/* Action Row */}
          <div className="text-center pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#A50021] hover:bg-[#7B0019] shadow transition"
            >
              Register as Voluntary Donor
            </Link>
            <Link
              href="/request"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 transition"
            >
              Submit Blood Request
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
