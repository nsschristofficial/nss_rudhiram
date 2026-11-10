import fs from 'fs';
import path from 'path';
import crypto, { randomUUID } from 'crypto';
import { Donor, BloodRequest, ActivityLog, DashboardStats, BloodGroup, AvailabilityStatus, RequestUrgency, RequestStatus, AdminUser } from '@/types';
import { initialDonors, initialBloodRequests, initialActivityLogs } from './seedData';
import { createAdminClient } from '../supabase/admin';
import { BLOOD_COMPATIBILITY } from '../constants';
import { isEligibleByDate } from '../utils';

// In Serverless environments like Vercel Lambda, the filesystem root is read-only.
// We prioritize /tmp if DATA_DIR cannot be written, plus an in-memory cache fallback.
const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'data') : path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'rudhiram-store.json');

// In-memory cache in case disk write is unavailable or across warm lambda invocations
let memoryStore: StoreData | null = null;

const defaultAdmins: AdminUser[] = [
  {
    id: 'admin_primary_01',
    email: 'admin@christcollegeijk.edu.in',
    name: 'NSS Programme Officer',
    role: 'superadmin',
    nss_unit: 'NSS Units 20 & 49, Christ College',
    created_at: new Date().toISOString(),
  },
  {
    id: 'admin_coord_02',
    email: 'coordinator@christcollegeijk.edu.in',
    name: 'NSS Student Volunteer Coordinator',
    role: 'coordinator',
    nss_unit: 'NSS Units 20 & 49',
    created_at: new Date().toISOString(),
  },
  {
    id: 'admin_view_03',
    email: 'viewer@christcollegeijk.edu.in',
    name: 'NSS Read-Only Observer Desk',
    role: 'viewer',
    nss_unit: 'Hospital / Observer Desk',
    created_at: new Date().toISOString(),
  },
];

interface StoreData {
  donors: Donor[];
  requests: BloodRequest[];
  logs: ActivityLog[];
  admins: AdminUser[];
}

function getLocalStore(): StoreData {
  if (memoryStore) {
    return memoryStore;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(STORE_FILE)) {
      // Check if project bundled store exists in process.cwd()/data/rudhiram-store.json
      const bundledPath = path.join(process.cwd(), 'data', 'rudhiram-store.json');
      let initial: StoreData;
      if (fs.existsSync(bundledPath)) {
        try {
          initial = JSON.parse(fs.readFileSync(bundledPath, 'utf-8'));
        } catch {
          initial = {
            donors: initialDonors,
            requests: initialBloodRequests,
            logs: initialActivityLogs,
            admins: defaultAdmins,
          };
        }
      } else {
        initial = {
          donors: initialDonors,
          requests: initialBloodRequests,
          logs: initialActivityLogs,
          admins: defaultAdmins,
        };
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      memoryStore = initial;
      return initial;
    }

    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.admins || parsed.admins.length === 0) {
      parsed.admins = defaultAdmins;
      saveLocalStore(parsed);
    }
    memoryStore = parsed;
    return parsed;
  } catch (err) {
    console.error('Filesystem access failed, using memory store:', err);
    if (!memoryStore) {
      memoryStore = {
        donors: initialDonors,
        requests: initialBloodRequests,
        logs: initialActivityLogs,
        admins: defaultAdmins,
      };
    }
    return memoryStore;
  }
}

function saveLocalStore(data: StoreData) {
  memoryStore = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist to disk, retained in memory:', err);
  }
}

export const repository = {
  // Activity Logging
  async logActivity(
    action: string,
    record_type: ActivityLog['record_type'],
    record_id?: string,
    details?: string,
    adminName: string = 'NSS Administrator'
  ): Promise<void> {
    const logItem: ActivityLog = {
      id: randomUUID ? randomUUID() : String(Date.now()),
      admin_name: adminName,
      action,
      record_type,
      record_id,
      details,
      timestamp: new Date().toISOString(),
    };

    const supabase = createAdminClient();
    if (supabase) {
      try {
        await supabase.from('activity_logs').insert([logItem]);
        return;
      } catch (e) {
        console.warn('Supabase log insert failed, saving to local store:', e);
      }
    }

    const store = getLocalStore();
    store.logs.unshift(logItem);
    // keep latest 200 logs
    if (store.logs.length > 200) store.logs = store.logs.slice(0, 200);
    saveLocalStore(store);
  },

  async getActivityLogs(limit = 50): Promise<ActivityLog[]> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(limit);
        if (!error && data) return data as ActivityLog[];
      } catch (e) {
        console.warn('Supabase get logs failed, using local store:', e);
      }
    }

    const store = getLocalStore();
    return store.logs.slice(0, limit);
  },

  // Donors
  async getDonors(filters?: {
    search?: string;
    blood_group?: string;
    district?: string;
    availability?: string;
  }): Promise<Donor[]> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        let query = supabase.from('donors').select('*').order('created_at', { ascending: false });

        if (filters?.blood_group && filters.blood_group !== 'ALL') {
          query = query.eq('blood_group', filters.blood_group);
        }
        if (filters?.district && filters.district !== 'ALL') {
          query = query.eq('district', filters.district);
        }
        if (filters?.availability && filters.availability !== 'ALL') {
          query = query.eq('availability', filters.availability);
        }
        if (filters?.search) {
          query = query.or(
            `full_name.ilike.%${filters.search}%,mobile.ilike.%${filters.search}%,locality.ilike.%${filters.search}%`
          );
        }

        const { data, error } = await query;
        if (!error && data) return data as Donor[];
      } catch (e) {
        console.warn('Supabase query failed, falling back to local store:', e);
      }
    }

    const store = getLocalStore();
    let result = [...store.donors];

    if (filters?.blood_group && filters.blood_group !== 'ALL') {
      result = result.filter((d) => d.blood_group === filters.blood_group);
    }
    if (filters?.district && filters.district !== 'ALL') {
      result = result.filter((d) => d.district.toLowerCase() === filters.district!.toLowerCase());
    }
    if (filters?.availability && filters.availability !== 'ALL') {
      result = result.filter((d) => d.availability === filters.availability);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.full_name.toLowerCase().includes(q) ||
          d.mobile.includes(q) ||
          d.locality.toLowerCase().includes(q) ||
          (d.email && d.email.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return result;
  },

  async getDonorById(id: string): Promise<Donor | null> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('donors').select('*').eq('id', id).single();
        if (!error && data) return data as Donor;
      } catch {}
    }

    const store = getLocalStore();
    return store.donors.find((d) => d.id === id) || null;
  },

  async createDonor(data: Omit<Donor, 'id' | 'created_at' | 'updated_at'>): Promise<Donor> {
    const store = getLocalStore();

    // Check duplicate phone in active records
    const existing = store.donors.find((d) => d.mobile === data.mobile);
    if (existing) {
      throw new Error(`A donor with mobile number ${data.mobile} is already registered.`);
    }

    const now = new Date().toISOString();
    const newDonor: Donor = {
      ...data,
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `donor_${Date.now()}`,
      created_at: now,
      updated_at: now,
    };

    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data: created, error } = await supabase.from('donors').insert([newDonor]).select().single();
        if (!error && created) {
          await this.logActivity(
            'New voluntary donor registered',
            'donor',
            created.id,
            `${created.full_name} (${created.blood_group}) from ${created.district}, ${created.locality}`
          );
          return created as Donor;
        }
      } catch (e) {
        console.warn('Supabase insert failed, storing locally:', e);
      }
    }

    store.donors.unshift(newDonor);
    saveLocalStore(store);

    await this.logActivity(
      'New voluntary donor registered',
      'donor',
      newDonor.id,
      `${newDonor.full_name} (${newDonor.blood_group}) from ${newDonor.district}, ${newDonor.locality}`
    );

    return newDonor;
  },

  async updateDonor(id: string, updates: Partial<Donor>, adminName = 'NSS Administrator'): Promise<Donor | null> {
    const now = new Date().toISOString();

    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('donors')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          await this.logActivity(
            `Donor record updated`,
            'donor',
            id,
            `Updated donor ${data.full_name}: ${Object.keys(updates).join(', ')}`,
            adminName
          );
          return data as Donor;
        }
      } catch {}
    }

    const store = getLocalStore();
    const idx = store.donors.findIndex((d) => d.id === id);
    if (idx === -1) return null;

    const updated = {
      ...store.donors[idx],
      ...updates,
      updated_at: now,
    };
    store.donors[idx] = updated;
    saveLocalStore(store);

    await this.logActivity(
      `Donor record updated`,
      'donor',
      id,
      `Updated donor ${updated.full_name}: ${Object.keys(updates).join(', ')}`,
      adminName
    );

    return updated;
  },

  async deleteDonor(id: string, adminName = 'NSS Administrator'): Promise<boolean> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('donors').delete().eq('id', id);
        if (!error) {
          await this.logActivity('Donor record deleted', 'donor', id, `Deleted donor record ID ${id}`, adminName);
          return true;
        }
      } catch {}
    }

    const store = getLocalStore();
    const target = store.donors.find((d) => d.id === id);
    if (!target) return false;

    store.donors = store.donors.filter((d) => d.id !== id);
    saveLocalStore(store);

    await this.logActivity('Donor record deleted', 'donor', id, `Deleted donor ${target.full_name}`, adminName);
    return true;
  },

  // Blood Requests
  async getBloodRequests(filters?: {
    search?: string;
    blood_group?: string;
    district?: string;
    urgency?: string;
    status?: string;
  }): Promise<BloodRequest[]> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        let query = supabase.from('blood_requests').select('*').order('created_at', { ascending: false });

        if (filters?.blood_group && filters.blood_group !== 'ALL') {
          query = query.eq('blood_group', filters.blood_group);
        }
        if (filters?.district && filters.district !== 'ALL') {
          query = query.eq('district', filters.district);
        }
        if (filters?.urgency && filters.urgency !== 'ALL') {
          query = query.eq('urgency', filters.urgency);
        }
        if (filters?.status && filters.status !== 'ALL') {
          query = query.eq('status', filters.status);
        }
        if (filters?.search) {
          query = query.or(
            `patient_name.ilike.%${filters.search}%,hospital_name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%`
          );
        }

        const { data, error } = await query;
        if (!error && data) {
          // Sort emergency first
          return (data as BloodRequest[]).sort((a, b) => {
            const urgencyOrder: Record<RequestUrgency, number> = { Emergency: 3, Urgent: 2, Normal: 1 };
            if (urgencyOrder[b.urgency] !== urgencyOrder[a.urgency]) {
              return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
        }
      } catch {}
    }

    const store = getLocalStore();
    let result = [...store.requests];

    if (filters?.blood_group && filters.blood_group !== 'ALL') {
      result = result.filter((r) => r.blood_group === filters.blood_group);
    }
    if (filters?.district && filters.district !== 'ALL') {
      result = result.filter((r) => r.district.toLowerCase() === filters.district!.toLowerCase());
    }
    if (filters?.urgency && filters.urgency !== 'ALL') {
      result = result.filter((r) => r.urgency === filters.urgency);
    }
    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter((r) => r.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.patient_name.toLowerCase().includes(q) ||
          r.hospital_name.toLowerCase().includes(q) ||
          r.contact_person.toLowerCase().includes(q) ||
          r.contact_number.includes(q)
      );
    }

    // Sort emergency requests to the top, then newest
    const urgencyOrder: Record<RequestUrgency, number> = { Emergency: 3, Urgent: 2, Normal: 1 };
    result.sort((a, b) => {
      if (urgencyOrder[b.urgency] !== urgencyOrder[a.urgency]) {
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  },

  async getBloodRequestById(id: string): Promise<BloodRequest | null> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('blood_requests').select('*').eq('id', id).single();
        if (!error && data) return data as BloodRequest;
      } catch {}
    }

    const store = getLocalStore();
    return store.requests.find((r) => r.id === id) || null;
  },

  async createBloodRequest(
    data: Omit<BloodRequest, 'id' | 'created_at' | 'updated_at'>
  ): Promise<BloodRequest> {
    const now = new Date().toISOString();
    const newRequest: BloodRequest = {
      ...data,
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `req_${Date.now()}`,
      created_at: now,
      updated_at: now,
    };

    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data: created, error } = await supabase
          .from('blood_requests')
          .insert([newRequest])
          .select()
          .single();
        if (!error && created) {
          await this.logActivity(
            `New blood request (${created.urgency})`,
            'blood_request',
            created.id,
            `Patient: ${created.patient_name}, Blood: ${created.blood_group} (${created.units_required} units) at ${created.hospital_name}`
          );
          return created as BloodRequest;
        }
      } catch (e) {
        console.warn('Supabase insert failed, storing locally:', e);
      }
    }

    const store = getLocalStore();
    store.requests.unshift(newRequest);
    saveLocalStore(store);

    await this.logActivity(
      `New blood request (${newRequest.urgency})`,
      'blood_request',
      newRequest.id,
      `Patient: ${newRequest.patient_name}, Blood: ${newRequest.blood_group} (${newRequest.units_required} units) at ${newRequest.hospital_name}`
    );

    return newRequest;
  },

  async updateBloodRequest(
    id: string,
    updates: Partial<BloodRequest>,
    adminName = 'NSS Administrator'
  ): Promise<BloodRequest | null> {
    const now = new Date().toISOString();

    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('blood_requests')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          const detailMsg = updates.status
            ? `Status changed to ${updates.status} for patient ${data.patient_name}`
            : `Updated request for ${data.patient_name}: ${Object.keys(updates).join(', ')}`;

          await this.logActivity(
            updates.status ? `Request status updated: ${updates.status}` : 'Request updated',
            'blood_request',
            id,
            detailMsg,
            adminName
          );
          return data as BloodRequest;
        }
      } catch {}
    }

    const store = getLocalStore();
    const idx = store.requests.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    const updated = {
      ...store.requests[idx],
      ...updates,
      updated_at: now,
    };
    store.requests[idx] = updated;
    saveLocalStore(store);

    const detailMsg = updates.status
      ? `Status changed to ${updates.status} for patient ${updated.patient_name}`
      : `Updated request for ${updated.patient_name}: ${Object.keys(updates).join(', ')}`;

    await this.logActivity(
      updates.status ? `Request status updated: ${updates.status}` : 'Request updated',
      'blood_request',
      id,
      detailMsg,
      adminName
    );

    return updated;
  },

  async deleteBloodRequest(id: string, adminName = 'NSS Administrator'): Promise<boolean> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('blood_requests').delete().eq('id', id);
        if (!error) {
          await this.logActivity('Blood request deleted', 'blood_request', id, `Deleted request ID ${id}`, adminName);
          return true;
        }
      } catch {}
    }

    const store = getLocalStore();
    const target = store.requests.find((r) => r.id === id);
    if (!target) return false;

    store.requests = store.requests.filter((r) => r.id !== id);
    saveLocalStore(store);

    await this.logActivity(
      'Blood request deleted',
      'blood_request',
      id,
      `Deleted request for patient ${target.patient_name}`,
      adminName
    );
    return true;
  },

  // Smart Donor Matching
  async matchDonors(params: {
    blood_group: BloodGroup;
    district?: string;
    locality?: string;
    availableOnly?: boolean;
  }): Promise<{
    exactMatches: Donor[];
    compatibleMatches: Donor[];
    totalMatched: number;
  }> {
    const allDonors = await this.getDonors({
      availability: params.availableOnly ? 'Available' : undefined,
    });

    const compatibleGroups = BLOOD_COMPATIBILITY[params.blood_group] || [params.blood_group];

    const exactMatches: Donor[] = [];
    const compatibleMatches: Donor[] = [];

    for (const donor of allDonors) {
      if (donor.blood_group === params.blood_group) {
        exactMatches.push(donor);
      } else if (compatibleGroups.includes(donor.blood_group)) {
        compatibleMatches.push(donor);
      }
    }

    // Helper sorting: same district first, then available, then eligible by date
    const scoreDonor = (d: Donor) => {
      let score = 0;
      if (params.district && d.district.toLowerCase() === params.district.toLowerCase()) {
        score += 50;
      }
      if (params.locality && d.locality.toLowerCase().includes(params.locality.toLowerCase())) {
        score += 25;
      }
      if (d.availability === 'Available') {
        score += 30;
      }
      if (isEligibleByDate(d.last_donation_date)) {
        score += 20;
      }
      return score;
    };

    exactMatches.sort((a, b) => scoreDonor(b) - scoreDonor(a));
    compatibleMatches.sort((a, b) => scoreDonor(b) - scoreDonor(a));

    return {
      exactMatches,
      compatibleMatches,
      totalMatched: exactMatches.length + compatibleMatches.length,
    };
  },

  // Calculated Real Database Statistics
  async getStats(): Promise<DashboardStats> {
    const donors = await this.getDonors();
    const requests = await this.getBloodRequests();

    const bloodGroupCounts: Record<BloodGroup, number> = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
      'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0,
    };

    const districtCounts: Record<string, number> = {};

    let availableDonors = 0;
    for (const d of donors) {
      if (bloodGroupCounts[d.blood_group] !== undefined) {
        bloodGroupCounts[d.blood_group]++;
      }
      districtCounts[d.district] = (districtCounts[d.district] || 0) + 1;
      if (d.availability === 'Available') availableDonors++;
    }

    let pendingRequests = 0;
    let completedRequests = 0;
    let emergencyRequests = 0;

    for (const r of requests) {
      if (r.status === 'Pending' || r.status === 'Under Review') pendingRequests++;
      if (r.status === 'Completed') completedRequests++;
      if (r.urgency === 'Emergency' && r.status !== 'Completed' && r.status !== 'Cancelled') {
        emergencyRequests++;
      }
    }

    return {
      totalDonors: donors.length,
      totalRequests: requests.length,
      pendingRequests,
      completedRequests,
      availableDonors,
      emergencyRequests,
      bloodGroupCounts,
      districtCounts,
    };
  },

  // Administrator Management
  async getAdmins(): Promise<Omit<AdminUser, 'password'>[]> {
    const store = getLocalStore();
    return store.admins.map(({ password, ...admin }) => admin);
  },

  async findAdminByCredentials(email: string, pass: string): Promise<AdminUser | null> {
    const store = getLocalStore();
    const cleanEmail = email.trim().toLowerCase();
    const admin = store.admins.find((a) => a.email.toLowerCase() === cleanEmail);
    if (!admin) return null;

    if (admin.password) {
      if (admin.password === pass) return admin;
      return null;
    }
    return null;
  },

  async createAdmin(
    data: { name: string; email: string; password?: string; role: AdminUser['role']; nss_unit?: string },
    actorName = 'Super Administrator'
  ): Promise<Omit<AdminUser, 'password'>> {
    const store = getLocalStore();
    const cleanEmail = data.email.trim().toLowerCase();

    if (store.admins.some((a) => a.email.toLowerCase() === cleanEmail)) {
      throw new Error(`An administrator with email ${data.email} already exists.`);
    }

    const newAdmin: AdminUser = {
      id: `admin_${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      role: data.role,
      nss_unit: data.nss_unit || 'NSS Units 20 & 49',
      created_at: new Date().toISOString(),
      password: data.password || 'Rudhiram#2026',
    };

    store.admins.push(newAdmin);
    saveLocalStore(store);

    await this.logActivity(
      `New administrator account created (${newAdmin.role})`,
      'auth',
      newAdmin.id,
      `Created ${newAdmin.role} account for ${newAdmin.name} (${newAdmin.email})`,
      actorName
    );

    const { password, ...safeAdmin } = newAdmin;
    return safeAdmin;
  },

  async deleteAdmin(id: string, actorName = 'Super Administrator'): Promise<boolean> {
    const store = getLocalStore();
    const target = store.admins.find((a) => a.id === id);
    if (!target) return false;

    if (target.id === 'admin_primary_01' || target.email.toLowerCase() === 'admin@christcollegeijk.edu.in') {
      throw new Error('The primary institutional administrator cannot be deleted.');
    }

    store.admins = store.admins.filter((a) => a.id !== id);
    saveLocalStore(store);

    await this.logActivity(
      `Administrator account deleted`,
      'auth',
      id,
      `Removed admin account: ${target.name} (${target.email})`,
      actorName
    );

    return true;
  },
};
