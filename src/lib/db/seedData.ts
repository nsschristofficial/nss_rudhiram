import { Donor, BloodRequest, ActivityLog } from '@/types';

// Production Ready: Zero sample / fake records as requested.
// Only real registrations and actual submissions will populate the database.
export const initialDonors: Donor[] = [];

export const initialBloodRequests: BloodRequest[] = [];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'system_init_01',
    admin_name: 'System',
    action: 'RUDHIRAM Portal Initialized',
    record_type: 'system',
    details: 'Portal database ready for voluntary registrations and blood requests.',
    timestamp: new Date().toISOString(),
  }
];
