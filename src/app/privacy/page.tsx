import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock, EyeOff, Database, Server, UserCheck } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy & Data Security Policy | RUDHIRAM – NSS Christ College Irinjalakuda',
  description: 'Detailed policy explaining the institutional confidentiality, data encryption, and access controls safeguarding donor and patient records.',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1 bg-white">
        <section className="bg-gradient-to-b from-red-50 to-white py-14 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A50021]">
              Information Governance &amp; Confidentiality
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
              Privacy &amp; Data Security Policy
            </h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Your trust is our paramount responsibility. Understand how the National Service Scheme, Christ College (Autonomous), Irinjalakuda safeguards voluntary donor and patient data.
            </p>
          </div>
        </section>

        <section className="py-14 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-sm text-gray-700 leading-relaxed">
          {/* Core Principle */}
          <div className="bg-red-50/60 border border-red-200 rounded-2xl p-6 space-y-2">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#A50021]" /> Zero Public Exposure Architecture
            </h2>
            <p>
              Unlike public directories or social media forums where phone numbers are exposed to spammers, <strong>RUDHIRAM never publishes donor lists, phone numbers, or patient requests on public web pages</strong>.
            </p>
            <p>
              Public access is strictly restricted to submitting donor registrations and blood assistance requests. All stored records reside behind PostgreSQL Row Level Security (RLS) policies and require cryptographically verified administrator authentication to access.
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-[#A50021]" /> 1. Information Collected &amp; Purpose Limitation
            </h3>
            <p>
              When an individual voluntarily registers as a blood donor, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Full Name, Age (confirming donor is &ge; 18 years old), and Gender.</li>
              <li>Blood Group (A+, A-, B+, B-, AB+, AB-, O+, O-).</li>
              <li>10-Digit Mobile Number and Optional Email Address.</li>
              <li>District, Place/Locality, and PIN Code.</li>
              <li>Last blood donation date and current availability status.</li>
            </ul>
            <p className="pt-1">
              <strong>Purpose Limitation:</strong> This data is processed exclusively for voluntary blood coordination during medical requirements in hospitals across Kerala. It is never sold, leased, or shared with commercial entities, advertisers, or third-party marketing companies.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#A50021]" /> 2. Patient &amp; Blood Request Confidentiality
            </h3>
            <p>
              Blood request submissions containing patient names, attending relatives, hospital wards, and required units are classified as sensitive healthcare data.
            </p>
            <p>
              Requests are visible only to verified NSS Programme Officers and designated Student Volunteer Coordinators inside the secure Administrator Dashboard. Once a request is fulfilled, records are marked as &apos;Completed&apos; and preserved in immutable audit logs.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-[#A50021]" /> 3. Technical Security Measures
            </h3>
            <p>
              RUDHIRAM employs industry-grade cybersecurity controls to protect the application and database infrastructure:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li><strong>Row Level Security (RLS):</strong> PostgreSQL database-level security policies prevent unauthorized SELECT queries from anonymous endpoints.</li>
              <li><strong>HMAC Signed Sessions &amp; httpOnly Cookies:</strong> Administrative credentials and session tokens cannot be accessed or manipulated via client-side JavaScript (XSS mitigation).</li>
              <li><strong>Rate Limiting &amp; Spam Protection:</strong> API routes enforce strict rate limiting on public form submissions to mitigate automated bot abuse.</li>
              <li><strong>Audit Logging:</strong> Every administrative action (login, status update, record edit, export) is recorded with timestamp and administrator identity in the activity logs.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#A50021]" /> 4. Donor Rights &amp; Record Removal
            </h3>
            <p>
              Voluntary donors retain full sovereignty over their registered information. Donors can at any time:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Update their availability status from &apos;Available&apos; to &apos;Busy&apos; or &apos;Inactive&apos;.</li>
              <li>Request complete deletion or deactivation of their donor record by contacting the NSS Desk at <strong className="text-gray-900">nss@christcollegeijk.edu.in</strong>.</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="border-t border-gray-200 pt-6 text-xs text-gray-500">
            <p>
              For inquiries regarding data governance, contact the Data Protection Officer / Programme Officers, National Service Scheme (NSS Units 20 &amp; 49), Christ College (Autonomous), Irinjalakuda, Kerala - 680125.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
