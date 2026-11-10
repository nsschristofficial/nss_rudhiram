'use client';

import React from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { AdminProvider, useAdmin } from '@/components/AdminContext';

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, closeSidebar } = useAdmin();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={closeSidebar}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#1A1A1E]">
            <AdminSidebar onCloseMobile={closeSidebar} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </AdminProvider>
  );
}
