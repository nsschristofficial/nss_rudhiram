import { cookies } from 'next/headers';
import crypto from 'crypto';
import { AdminUser } from '@/types';
import { repository } from '../db/repository';

const COOKIE_NAME = 'rudhiram_admin_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'nss_christ_college_irinjalakuda_rudhiram_secure_key_2026';

// Institutional admin account defaults for NSS Units 20 & 49
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@christcollegeijk.edu.in';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'NSSChrist#2026';

export function signToken(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifyToken(token: string): any | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      const json = Buffer.from(data, 'base64url').toString('utf-8');
      const parsed = JSON.parse(json);
      // Check expiration (24 hours)
      if (parsed.exp && parsed.exp < Date.now()) {
        return null;
      }
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export async function verifyAdminCredentials(email: string, pass: string): Promise<AdminUser | null> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Primary Institutional Administrator (Super Admin)
  if (
    cleanEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() &&
    pass === DEFAULT_ADMIN_PASSWORD
  ) {
    return {
      id: 'admin_primary_01',
      email: DEFAULT_ADMIN_EMAIL,
      name: 'NSS Programme Officer',
      role: 'superadmin',
      nss_unit: 'NSS Units 20 & 49, Christ College',
      last_login: new Date().toISOString(),
    };
  }

  // 2. NSS Student Coordinator account (Full Operations)
  if (
    cleanEmail === 'coordinator@christcollegeijk.edu.in' &&
    pass === (process.env.COORDINATOR_PASSWORD || 'Rudhiram#Coord2026')
  ) {
    return {
      id: 'admin_coord_02',
      email: 'coordinator@christcollegeijk.edu.in',
      name: 'NSS Student Volunteer Coordinator',
      role: 'coordinator',
      nss_unit: 'NSS Units 20 & 49',
      last_login: new Date().toISOString(),
    };
  }

  // 3. View-Only Observer / Hospital Representative Account (Read-Only)
  if (
    cleanEmail === 'viewer@christcollegeijk.edu.in' &&
    pass === (process.env.VIEWER_PASSWORD || 'Rudhiram#View2026')
  ) {
    return {
      id: 'admin_view_03',
      email: 'viewer@christcollegeijk.edu.in',
      name: 'NSS Read-Only Observer Desk',
      role: 'viewer',
      nss_unit: 'Hospital / View-Only Portal',
      last_login: new Date().toISOString(),
    };
  }

  // 4. Check dynamic administrator accounts created by Super Admin
  const customAdmin = await repository.findAdminByCredentials(cleanEmail, pass);
  if (customAdmin) {
    return {
      id: customAdmin.id,
      email: customAdmin.email,
      name: customAdmin.name,
      role: customAdmin.role,
      nss_unit: customAdmin.nss_unit,
      last_login: new Date().toISOString(),
    };
  }

  return null;
}

export async function setAdminSession(user: AdminUser) {
  const cookieStore = cookies();
  const exp = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const token = signToken({ ...user, exp });

  const isSecure = process.env.COOKIE_SECURE === 'true' || process.env.VERCEL === '1';

  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60, // 24h
  });
}

export async function getAdminSession(): Promise<AdminUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || !payload.id) return null;

  return {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    nss_unit: payload.nss_unit,
    last_login: payload.last_login,
  };
}

export async function clearAdminSession() {
  const cookieStore = cookies();
  const isSecure = process.env.COOKIE_SECURE === 'true' || process.env.VERCEL === '1';
  cookieStore.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
