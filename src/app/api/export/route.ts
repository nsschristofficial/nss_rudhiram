import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { getAdminSession } from '@/lib/auth/session';
import { sanitizeCsvField, formatDate } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'donors'; // 'donors' or 'requests'
  const blood_group = searchParams.get('blood_group') || undefined;
  const district = searchParams.get('district') || undefined;
  const today = new Date().toISOString().split('T')[0];

  try {
    if (type === 'donors') {
      const donors = await repository.getDonors({ blood_group, district });

      const headers = [
        'Donor ID',
        'Full Name',
        'Age',
        'Gender',
        'Blood Group',
        'Mobile Number',
        'Email Address',
        'District',
        'Locality',
        'PIN Code',
        'Availability',
        'Last Donation Date',
        'Additional Notes',
        'Registration Date',
      ];

      const rows = donors.map((d) => [
        sanitizeCsvField(d.id),
        sanitizeCsvField(d.full_name),
        sanitizeCsvField(d.age),
        sanitizeCsvField(d.gender || ''),
        sanitizeCsvField(d.blood_group),
        sanitizeCsvField(d.mobile),
        sanitizeCsvField(d.email || ''),
        sanitizeCsvField(d.district),
        sanitizeCsvField(d.locality),
        sanitizeCsvField(d.pincode),
        sanitizeCsvField(d.availability),
        sanitizeCsvField(d.last_donation_date || 'None'),
        sanitizeCsvField(d.additional_information || ''),
        sanitizeCsvField(formatDate(d.created_at)),
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

      await repository.logActivity(
        'Exported donor records (CSV)',
        'export',
        undefined,
        `Exported ${donors.length} records. Filter: blood_group=${blood_group || 'ALL'}, district=${district || 'ALL'}`,
        admin.name
      );

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="rudhiram_donors_${today}.csv"`,
        },
      });
    } else if (type === 'requests') {
      const requests = await repository.getBloodRequests({ blood_group, district });

      const headers = [
        'Request ID',
        'Patient Name',
        'Contact Person',
        'Contact Mobile',
        'Blood Group',
        'Units Required',
        'Hospital Name',
        'Hospital Location',
        'District',
        'Required Date',
        'Urgency Level',
        'Status',
        'Additional Info',
        'Submission Date',
      ];

      const rows = requests.map((r) => [
        sanitizeCsvField(r.id),
        sanitizeCsvField(r.patient_name),
        sanitizeCsvField(r.contact_person),
        sanitizeCsvField(r.contact_number),
        sanitizeCsvField(r.blood_group),
        sanitizeCsvField(r.units_required),
        sanitizeCsvField(r.hospital_name),
        sanitizeCsvField(r.hospital_location),
        sanitizeCsvField(r.district),
        sanitizeCsvField(r.required_date),
        sanitizeCsvField(r.urgency),
        sanitizeCsvField(r.status),
        sanitizeCsvField(r.additional_information || ''),
        sanitizeCsvField(formatDate(r.created_at)),
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

      await repository.logActivity(
        'Exported blood requests (CSV)',
        'export',
        undefined,
        `Exported ${requests.length} records. Filter: blood_group=${blood_group || 'ALL'}, district=${district || 'ALL'}`,
        admin.name
      );

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="rudhiram_requests_${today}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid export type.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to export data.' }, { status: 500 });
  }
}
