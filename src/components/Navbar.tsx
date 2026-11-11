'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Heart, Droplet, Shield, Phone, ArrowUpRight } from 'lucide-react';
import { INSTITUTION_INFO } from '@/lib/constants';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Register as Donor', href: '/register', highlight: true },
    { name: 'Request Blood', href: '/request', urgent: true },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full overflow-hidden">
      {/* Institutional Micro Announcement Bar */}
      <div className="bg-[#1C1917] text-gray-300 py-1.5 px-3 sm:px-4 text-[11px] font-medium tracking-wide border-b border-white/10 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="font-semibold text-white tracking-wide truncate text-[10px] sm:text-[11px]">
              Christ College (Autonomous), Irinjalakuda
            </span>
            <span className="text-gray-500 hidden sm:inline">•</span>
            <span className="text-gray-400 hidden sm:inline">NSS Units 20 &amp; 49</span>
            <span className="text-gray-500 hidden md:inline">•</span>
            <span className="text-gray-400 hidden md:inline">University of Calicut</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <a
              href="tel:+917907178135"
              className="hidden md:inline-flex items-center gap-1.5 text-gray-300 hover:text-white transition"
            >
              <Phone className="w-3 h-3 text-red-400" />
              <span>NSS Helpline: <strong className="text-white">+91 7907178135</strong></span>
            </a>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-xs border border-white/10 whitespace-nowrap"
            >
              <Shield className="w-3 h-3 text-red-300" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Glass Navigation Header */}
      <div className="backdrop-blur-md bg-white/95 border-b border-gray-100/80 shadow-xs w-full">
        <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & Identity */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3.5 group min-w-0">
              <div className="flex items-center -space-x-2 hover:space-x-1 transition-all duration-300 flex-shrink-0">
                <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl overflow-hidden p-1 bg-white shadow-md border border-gray-100 flex-shrink-0 group-hover:rotate-[-4deg] transition duration-300">
                  <Image
                    src="/images/christ-college-logo.jpg"
                    alt="Christ College Crest"
                    fill
                    className="object-contain p-0.5"
                    sizes="44px"
                    priority
                  />
                </div>
                <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl overflow-hidden p-1 bg-white shadow-md border border-gray-100 flex-shrink-0 group-hover:rotate-[4deg] transition duration-300">
                  <Image
                    src="/images/nss-logo.png"
                    alt="NSS Logo"
                    fill
                    className="object-contain p-0.5"
                    sizes="44px"
                    priority
                  />
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-[#A50021] group-hover:text-[#7B0019] transition">
                    RUDHIRAM
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-bold bg-red-50 text-[#A50021] border border-red-200">
                    NSS
                  </span>
                </div>
                <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-wider sm:tracking-widest text-gray-400 truncate">
                  Centralised Blood Donor Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1.5">
              {navLinks.map((link) => {
                if (link.urgent) {
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="ml-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#A50021] text-white hover:bg-[#85001a] shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      <Droplet className="w-3.5 h-3.5 fill-white" />
                      <span>{link.name}</span>
                    </Link>
                  );
                }

                if (link.highlight) {
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="ml-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-[#A50021] bg-red-50/70 hover:bg-red-100/70 border border-red-200/60 hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      <Heart className="w-3.5 h-3.5 fill-[#A50021]" />
                      <span>{link.name}</span>
                    </Link>
                  );
                }

                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                      active
                        ? 'text-[#A50021] bg-red-50/60 font-bold'
                        : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100/60'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Actions: Request Button & Hamburger */}
            <div className="lg:hidden flex items-center gap-1.5 flex-shrink-0">
              <Link
                href="/request"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-[#A50021] text-white shadow-xs"
              >
                <Droplet className="w-3 h-3 fill-white" />
                <span>Request</span>
              </Link>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 px-6 py-6 space-y-3 shadow-xl animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-2xl text-sm font-bold transition ${
                link.urgent
                  ? 'bg-[#A50021] text-white text-center shadow-md'
                  : link.highlight
                  ? 'bg-red-50 text-[#A50021] border border-red-200 text-center'
                  : isActive(link.href)
                  ? 'text-[#A50021] bg-red-50/40'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
            <a
              href="tel:+917907178135"
              className="flex items-center gap-2 p-3 rounded-2xl bg-gray-50 text-gray-800 font-medium"
            >
              <Phone className="w-4 h-4 text-[#A50021]" />
              <span>Helpline: +91 7907178135</span>
            </a>
            <Link
              href="/admin/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-gray-900 text-white font-bold"
            >
              <Shield className="w-4 h-4 text-red-400" />
              <span>Administrator Login</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
