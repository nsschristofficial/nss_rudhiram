'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Droplet,
  HeartHandshake,
  FileSpreadsheet,
  History,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  UserCheck,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { AdminUser } from '@/types';

import { useAdmin } from './AdminContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function AdminSidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser: currentUser, isViewer } = useAdmin();

  const menuItems = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Donor Management', href: '/admin/dashboard/donors', icon: Users },
    { name: 'Blood Requests', href: '/admin/dashboard/requests', icon: Droplet },
    { name: 'Smart Donor Matching', href: '/admin/dashboard/match', icon: HeartHandshake },
    { name: 'Connected Fulfillments', href: '/admin/dashboard/fulfillments', icon: CheckCircle2 },
    { name: 'Activity Logs', href: '/admin/dashboard/logs', icon: History },
    { name: 'Export Data', href: '/admin/dashboard/export', icon: FileSpreadsheet },
    { name: 'Manage Admins', href: '/admin/dashboard/admins', icon: UserCheck },
    { name: 'Settings & Info', href: '/admin/dashboard/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-[#1A1A1E] text-gray-300 flex flex-col h-full border-r border-gray-800 flex-shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white p-0.5 shadow-sm flex-shrink-0">
            <Image
              src="/images/christ-college-logo.jpg"
              alt="Christ College Crest"
              fill
              className="object-contain"
              sizes="40px"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg text-[#E02446] tracking-tight">RUDHIRAM</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${
                currentUser?.role === 'viewer'
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : 'bg-red-950 text-red-200 border border-red-800'
              }`}>
                {currentUser?.role === 'viewer' ? 'VIEW-ONLY' : 'ADMIN'}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium truncate">
              {currentUser?.role === 'viewer' ? 'Observer / Read-Only Desk' : 'NSS Units 20 & 49, Christ College'}
            </p>
          </div>
        </div>
        {currentUser?.role === 'viewer' && (
          <div className="mt-3 p-2 bg-amber-950/40 border border-amber-900/60 rounded-xl text-[10px] text-amber-300 flex items-center gap-1.5 font-medium">
            <Eye className="w-3.5 h-3.5 flex-shrink-0" />
            <span>View-Only Access: Edits disabled</span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-3 pb-2 pt-1">
          Administration Modules
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                active
                  ? 'bg-[#A50021] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-gray-800/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-3 pb-2">
            Public Website
          </div>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            <span className="flex items-center gap-3">
              <Shield className="w-4 h-4" />
              <span>View Public Portal</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-50" />
          </Link>
        </div>
      </nav>

      {/* Logout Action in Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-300 hover:text-white bg-red-950/40 hover:bg-red-900 border border-red-900/50 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
