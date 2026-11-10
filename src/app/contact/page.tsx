import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { INSTITUTION_INFO } from '@/lib/constants';
import { MapPin, Phone, Mail, Clock, Heart, Building, ExternalLink, ShieldCheck } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact NSS RUDHIRAM | Christ College (Autonomous), Irinjalakuda',
  description: 'Official contact numbers for student coordinators Krishna Priya, Alex, Sreesanth and mail nsschrist.official@gmail.com.',
};

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1 bg-white">
        {/* Soft Flowing Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/60 via-red-50/20 to-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-red-200 text-xs font-bold uppercase tracking-wider text-[#A50021] shadow-xs">
              <Heart className="w-3.5 h-3.5 fill-[#A50021]" /> NSS Coordination Desk
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
              Get in Touch with Our Team
            </h1>
            <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
              Have an urgent blood requirement or need assistance? Reach our dedicated NSS student coordinators directly.
            </p>
          </div>
        </section>

        {/* Fluid Contact Cards */}
        <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* 3 Student Coordinators Grid */}
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Official Student Coordinators
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Direct phone lines for hospital blood coordination and donor support
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {INSTITUTION_INFO.coordinators.map((coord, idx) => (
                <div
                  key={coord.name}
                  className="relative group bg-white rounded-3xl p-6 border border-gray-200/80 hover:border-red-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center space-y-4"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-red-100 to-rose-50 text-[#A50021] flex items-center justify-center shadow-inner group-hover:scale-110 transition duration-300">
                    <Phone className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {coord.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#A50021] mt-0.5">
                      {coord.role}
                    </p>
                  </div>

                  <a
                    href={`tel:${coord.phone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-2xl bg-red-50 hover:bg-[#A50021] text-[#A50021] hover:text-white font-mono font-bold text-sm tracking-wide transition duration-200"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{coord.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Clean Info Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Contact */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 border border-gray-200/70 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-[#A50021] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Official Email Desk</h3>
              <p className="text-xs text-gray-600">
                For official circulars, camp planning, or institutional collaboration:
              </p>
              <a
                href={`mailto:${INSTITUTION_INFO.email}`}
                className="text-base font-bold text-[#A50021] hover:underline block truncate"
              >
                {INSTITUTION_INFO.email}
              </a>
            </div>

            {/* Campus Location */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 border border-gray-200/70 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-[#A50021] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">College Campus</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {INSTITUTION_INFO.address}
              </p>
              <a
                href={INSTITUTION_INFO.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#A50021] hover:underline font-semibold inline-flex items-center gap-1 pt-1"
              >
                christcollegeijk.edu.in <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Clean Guidance Note */}
          <div className="rounded-3xl bg-gray-50/70 border border-gray-200/60 p-6 flex items-start gap-4 text-xs text-gray-600">
            <div className="w-9 h-9 rounded-2xl bg-red-100 text-[#A50021] flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-gray-900">Need Immediate Blood Assistance?</h4>
              <p className="leading-relaxed">
                Please submit a request via our <Link href="/request" className="text-[#A50021] font-bold hover:underline">Blood Request form</Link> or call any of the student coordinators above. Our volunteer network will quickly identify matching registered donors.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
