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
  const type = searchParams.get('type') || 'donors'; // 'donors' | 'requests' | 'fulfillments'
  const blood_group = searchParams.get('blood_group') || undefined;
  const district = searchParams.get('district') || undefined;
  const hospital_name = searchParams.get('hospital_name') || undefined;
  const today = new Date().toISOString().split('T')[0];

  try {
    if (type === 'fulfillments') {
      const fulfillments = await repository.getFulfillments({ blood_group, district, hospital_name });

      const headers = [
        'Fulfillment ID',
        'Request ID',
        'Donor ID',
        'Patient Name',
        'Donor Name',
        'Blood Group',
        'Units Donated',
        'Hospital Name',
        'Hospital Location',
        'District',
        'Patient Contact Person',
        'Patient Contact Number',
        'Donor Mobile',
        'Donor Locality',
        'Donor District',
        'Donation Date',
        'Connected By',
        'Cooldown Until',
        'Notes',
        'Timestamp',
      ];

      const rows = fulfillments.map((f) => [
        sanitizeCsvField(f.id),
        sanitizeCsvField(f.requestId),
        sanitizeCsvField(f.donorId),
        sanitizeCsvField(f.patient_name),
        sanitizeCsvField(f.donor_name),
        sanitizeCsvField(f.blood_group),
        sanitizeCsvField(f.units_required),
        sanitizeCsvField(f.hospital_name),
        sanitizeCsvField(f.hospital_location || ''),
        sanitizeCsvField(f.district),
        sanitizeCsvField(f.patient_contact_person),
        sanitizeCsvField(f.patient_contact_number),
        sanitizeCsvField(f.donor_mobile),
        sanitizeCsvField(f.donor_locality || ''),
        sanitizeCsvField(f.donor_district || ''),
        sanitizeCsvField(f.donation_date),
        sanitizeCsvField(f.connected_by),
        sanitizeCsvField(f.cooldown_until),
        sanitizeCsvField(f.notes || ''),
        sanitizeCsvField(formatDate(f.created_at)),
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

      await repository.logActivity(
        'Exported fulfillment pairings (CSV)',
        'export',
        undefined,
        `Exported ${fulfillments.length} fulfilled connections. Filter: blood_group=${blood_group || 'ALL'}, district=${district || 'ALL'}`,
        admin.name
      );

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="rudhiram_fulfillments_${today}.csv"`,
        },
      });
    } else if (type === 'donors') {
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
