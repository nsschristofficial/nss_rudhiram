import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BloodRequestForm from '@/components/BloodRequestForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Request Blood Assistance | RUDHIRAM – NSS Christ College Irinjalakuda',
  description: 'Submit an emergency or scheduled blood assistance request for hospital patients in Thrissur and Irinjalakuda through NSS Units 20 & 49.',
};

export default function RequestPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <BloodRequestForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
