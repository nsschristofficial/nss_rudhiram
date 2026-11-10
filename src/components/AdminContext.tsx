'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '@/types';

interface AdminContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  adminUser: AdminUser | null;
  loadingUser: boolean;
  isViewer: boolean;
  isSuperAdmin: boolean;
  refreshAdmin: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType>({
  sidebarOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
  adminUser: null,
  loadingUser: true,
  isViewer: false,
  isSuperAdmin: false,
  refreshAdmin: async () => {},
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchSession = async () => {
    try {
      setLoadingUser(true);
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        setAdminUser(data.user || null);
      } else {
        setAdminUser(null);
      }
    } catch {
      setAdminUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const isViewer = adminUser?.role === 'viewer';
  const isSuperAdmin = adminUser?.role === 'superadmin';

  return (
    <AdminContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar: () => setSidebarOpen((prev) => !prev),
        closeSidebar: () => setSidebarOpen(false),
        adminUser,
        loadingUser,
        isViewer,
        isSuperAdmin,
        refreshAdmin: fetchSession,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
