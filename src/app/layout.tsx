import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'RUDHIRAM – A Centralised Blood Donor Portal | NSS Units 20 & 49, Christ College Irinjalakuda',
  description:
    'An institutional initiative by National Service Scheme (NSS Units 20 & 49), Christ College (Autonomous), Irinjalakuda, University of Calicut, to connect voluntary blood donors and streamline blood donation coordination.',
  keywords: [
    'Rudhiram',
    'NSS Christ College',
    'Blood Donation Kerala',
    'Irinjalakuda Blood Bank',
    'Thrissur Blood Donors',
    'NSS Units 20 & 49',
    'Voluntary Blood Donor Portal',
  ],
  authors: [{ name: 'NSS Units 20 & 49, Christ College (Autonomous), Irinjalakuda' }],
  icons: {
    icon: '/images/nss-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col font-sans antialiased text-[#242424] bg-white selection:bg-[#A50021] selection:text-white">
        {children}
      </body>
    </html>
  );
}
