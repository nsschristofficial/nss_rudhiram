import { BloodGroup } from '@/types';

export const INSTITUTION_INFO = {
  name: 'Christ College (Autonomous), Irinjalakuda',
  nssUnits: 'NSS Units 20 & 49',
  university: 'University of Calicut',
  portalName: 'RUDHIRAM',
  portalFullName: 'RUDHIRAM – A Centralised Blood Donor Portal',
  tagline: 'RESPOND. REGISTER. DONATE. BECAUSE HUMANITY FLOWS IN ALL OF US.',
  address: 'Christ College (Autonomous), Irinjalakuda, Thrissur District, Kerala - 680125',
  email: 'nsschrist.official@gmail.com',
  website: 'https://christcollegeijk.edu.in',
  coordinators: [
    { name: 'Krishna Priya', phone: '+91 7907178135', role: 'Student Coordinator' },
    { name: 'Alex', phone: '+91 9746371985', role: 'Student Coordinator' },
    { name: 'Sreesanth', phone: '+91 8129899218', role: 'Student Coordinator' },
  ],
};

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const KERALA_DISTRICTS = [
  'Thrissur', // Christ College primary district
  'Ernakulam',
  'Palakkad',
  'Malappuram',
  'Kozhikode',
  'Alappuzha',
  'Kottayam',
  'Idukki',
  'Wayanad',
  'Kannur',
  'Kasaragod',
  'Pathanamthitta',
  'Kollam',
  'Thiruvananthapuram',
];

// Clinical initial matching compatibility rules for administrative coordination
// Recipient Blood Group -> Compatible Donor Blood Groups
export const BLOOD_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Recipient for RBC
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'], // Universal Donor for RBC
};

export const BLOOD_DONOR_TARGETS: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'O+': ['A+', 'B+', 'AB+', 'O+'],
  'B-': ['B+', 'B-', 'AB+', 'AB-'],
  'B+': ['B+', 'AB+'],
  'A-': ['A+', 'A-', 'AB+', 'AB-'],
  'A+': ['A+', 'AB+'],
  'AB-': ['AB+', 'AB-'],
  'AB+': ['AB+'],
};
