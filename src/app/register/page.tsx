import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DonorRegistrationForm from '@/components/DonorRegistrationForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register as a Voluntary Blood Donor | RUDHIRAM – NSS Christ College Irinjalakuda',
  description: 'Join the NSS Units 20 & 49 voluntary blood donor network at Christ College (Autonomous), Irinjalakuda. Your pledge helps save lives in medical emergencies.',
};

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <DonorRegistrationForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
