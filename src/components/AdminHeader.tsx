'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, User, LogOut } from 'lucide-react';
import { AdminUser } from '@/types';
import { useAdmin } from './AdminContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onToggleSidebar?: () => void;
}

export default function AdminHeader({ title, subtitle, onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const { toggleSidebar, adminUser, isViewer } = useAdmin();

  const handleToggle = onToggleSidebar || toggleSidebar;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-gray-500 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Read-Only Observer Indicator */}
        {adminUser?.role === 'viewer' && (
          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
            👁️ READ-ONLY OBSERVER
          </span>
        )}

        {/* Administrator Profile Pill */}
        <div className="flex items-center gap-2 pl-3 py-1 pr-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs">
          <div className="w-6 h-6 rounded-full bg-[#A50021] text-white flex items-center justify-center font-bold text-[10px]">
            {adminUser?.name ? adminUser.name.charAt(0) : 'A'}
          </div>
          <div className="hidden sm:block text-left mr-1">
            <div className="font-bold text-gray-800 leading-tight">
              {adminUser?.name || 'NSS Officer'}
            </div>
            <div className="text-[10px] text-gray-500 font-medium">
              {adminUser?.role === 'superadmin'
                ? 'Super Administrator'
                : adminUser?.role === 'viewer'
                ? 'Read-Only Observer'
                : 'Coordinator'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1 rounded-full text-gray-400 hover:text-red-700 hover:bg-gray-200 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
