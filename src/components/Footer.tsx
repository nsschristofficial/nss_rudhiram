import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Phone, Mail, MapPin, ArrowUpRight, Shield } from 'lucide-react';
import { INSTITUTION_INFO } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-[#151313] text-gray-400 relative overflow-hidden">
      {/* Organic top wave transition */}
      <div className="w-full overflow-hidden leading-none rotate-180">
        <svg
          className="relative block w-full h-8 text-white fill-current"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,50 L1200,120 L0,120 Z"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Identity & Mission (Col 1-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white/95 p-1 shadow-md">
                <Image
                  src="/images/christ-college-logo.jpg"
                  alt="Christ College Crest"
                  fill
                  className="object-contain p-0.5"
                  sizes="48px"
                />
              </div>
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white/95 p-1 shadow-md">
                <Image
                  src="/images/nss-logo.png"
                  alt="NSS Logo"
                  fill
                  className="object-contain p-0.5"
                  sizes="48px"
                />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight text-white">
                  RUDHIRAM
                </h3>
                <p className="text-[10px] uppercase font-bold tracking-widest text-red-400">
                  NSS Units 20 &amp; 49
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed max-w-md">
              A centralised digital initiative by the National Service Scheme, Christ College (Autonomous), Irinjalakuda. Simplifying voluntary blood donation coordination across Central Kerala.
            </p>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs text-gray-300 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-red-400 font-bold block">Official Motto</span>
              <p className="italic text-gray-200 font-medium">
                &ldquo;{INSTITUTION_INFO.tagline}&rdquo;
              </p>
            </div>
          </div>

          {/* Clean Portal Navigation (Col 6-8) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register" className="text-gray-400 hover:text-white transition inline-flex items-center gap-1.5 group">
                  <ArrowUpRight className="w-3.5 h-3.5 text-red-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                  <span>Register as Voluntary Donor</span>
                </Link>
              </li>
              <li>
                <Link href="/request" className="text-gray-400 hover:text-white transition inline-flex items-center gap-1.5 group">
                  <ArrowUpRight className="w-3.5 h-3.5 text-red-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                  <span>Request Blood Units</span>
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-400 hover:text-white transition inline-flex items-center gap-1.5 group">
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition" />
                  <span>How Coordination Works</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition inline-flex items-center gap-1.5 group">
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition" />
                  <span>About NSS Units 20 &amp; 49</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition inline-flex items-center gap-1.5 group">
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition" />
                  <span>Data Security &amp; Privacy</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-gray-400 hover:text-white transition inline-flex items-center gap-1.5 group">
                  <Shield className="w-3.5 h-3.5 text-red-400" />
                  <span>Administrator Sign In</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Coordinators & Helplines (Col 9-12) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-white">
              NSS Student Coordinators
            </h4>

            <div className="space-y-2 text-xs">
              {INSTITUTION_INFO.coordinators.map((c) => (
                <div key={c.name} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <div>
                    <span className="font-semibold text-gray-200 block">{c.name}</span>
                    <span className="text-[10px] text-gray-500">{c.role}</span>
                  </div>
                  <a
                    href={`tel:${c.phone.replace(/\s+/g, '')}`}
                    className="font-mono text-red-400 hover:text-red-300 font-bold text-xs"
                  >
                    {c.phone}
                  </a>
                </div>
              ))}

              <div className="pt-2 flex items-center gap-2 text-xs text-gray-300">
                <Mail className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <a href={`mailto:${INSTITUTION_INFO.email}`} className="hover:text-white underline">
                  {INSTITUTION_INFO.email}
                </a>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-gray-400 pt-1">
                <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>Christ College (Autonomous), Irinjalakuda - 680125</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} RUDHIRAM • National Service Scheme, Christ College (Autonomous), Irinjalakuda.
          </p>
          <p className="text-[11px]">
            Affiliated to University of Calicut • Accredited NAAC A++
          </p>
        </div>
      </div>
    </footer>
  );
}
