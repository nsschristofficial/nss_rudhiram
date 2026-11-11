export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type AvailabilityStatus = 'Available' | 'Busy' | 'Inactive';

export type RequestUrgency = 'Normal' | 'Urgent' | 'Emergency';

export type RequestStatus = 'Pending' | 'Under Review' | 'Donor Identified' | 'Completed' | 'Cancelled';

export interface Donor {
  id: string;
  full_name: string;
  age: number;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  blood_group: BloodGroup;
  mobile: string;
  email?: string;
  district: string;
  locality: string;
  pincode: string;
  last_donation_date?: string | null;
  availability: AvailabilityStatus;
  additional_information?: string;
  consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface BloodRequest {
  id: string;
  patient_name: string;
  contact_person: string;
  contact_number: string;
  blood_group: BloodGroup;
  units_required: number;
  hospital_name: string;
  hospital_location: string;
  district: string;
  required_date: string;
  urgency: RequestUrgency;
  additional_information?: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  admin_id?: string;
  admin_name?: string;
  action: string;
  record_type: 'donor' | 'blood_request' | 'auth' | 'export' | 'system' | 'fulfillment';
  record_id?: string;
  details?: string;
  timestamp: string;
}

export interface FulfillmentRecord {
  id: string;
  requestId: string;
  donorId: string;
  patient_name: string;
  donor_name: string;
  blood_group: BloodGroup;
  units_required: number;
  hospital_name: string;
  hospital_location: string;
  district: string;
  patient_contact_person: string;
  patient_contact_number: string;
  donor_mobile: string;
  donor_locality: string;
  donor_district: string;
  donation_date: string;
  connected_by: string;
  cooldown_until: string;
  notes?: string;
  created_at: string;
}

export type AdminRole = 'superadmin' | 'coordinator' | 'volunteer' | 'viewer';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  nss_unit?: string;
  last_login?: string;
  created_at?: string;
  password?: string;
}

export interface DashboardStats {
  totalDonors: number;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  availableDonors: number;
  emergencyRequests: number;
  bloodGroupCounts: Record<BloodGroup, number>;
  districtCounts: Record<string, number>;
}
