import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { getAdminSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (admin.role === 'viewer') {
    return NextResponse.json(
      { error: 'Forbidden. View-only administrators cannot connect donors to requests.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { donorId, requestId, donationDate } = body;

    if (!donorId || !requestId) {
      return NextResponse.json(
        { error: 'donorId and requestId are required.' },
        { status: 400 }
      );
    }

    const todayDate = donationDate || new Date().toISOString().split('T')[0];

    // 1. Fetch donor and request
    const donor = await repository.getDonorById(donorId);
    if (!donor) {
      return NextResponse.json({ error: 'Donor not found.' }, { status: 404 });
    }

    const bloodReq = await repository.getBloodRequestById(requestId);
    if (!bloodReq) {
      return NextResponse.json({ error: 'Blood request not found.' }, { status: 404 });
    }

    // 2. Update Request status to 'Completed'
    const updatedRequest = await repository.updateBloodRequest(
      requestId,
      {
        status: 'Completed',
        additional_information: `${bloodReq.additional_information ? bloodReq.additional_information + ' | ' : ''}Fulfilled by donor: ${donor.full_name} (${donor.blood_group}, Ph: +91 ${donor.mobile}) on ${todayDate}`,
      },
      admin.name
    );

    // 3. Mark Donor as Busy (Unavailable) & set last donation date to today
    const updatedDonor = await repository.updateDonor(
      donorId,
      {
        availability: 'Busy',
        last_donation_date: todayDate,
        additional_information: `${donor.additional_information ? donor.additional_information + ' | ' : ''}Donated for Patient: ${bloodReq.patient_name} at ${bloodReq.hospital_name} on ${todayDate}`,
      },
      admin.name
    );

    // 4. Calculate 90-day cooldown date
    const dDate = new Date(todayDate);
    dDate.setDate(dDate.getDate() + 90);
    const cooldownUntil = dDate.toISOString().split('T')[0];

    // 5. Create persistent Fulfillment record
    const fulfillment = await repository.createFulfillment({
      requestId: bloodReq.id,
      donorId: donor.id,
      patient_name: bloodReq.patient_name,
      donor_name: donor.full_name,
      blood_group: bloodReq.blood_group,
      units_required: bloodReq.units_required,
      hospital_name: bloodReq.hospital_name,
      hospital_location: bloodReq.hospital_location || '',
      district: bloodReq.district,
      patient_contact_person: bloodReq.contact_person,
      patient_contact_number: bloodReq.contact_number,
      donor_mobile: donor.mobile,
      donor_locality: donor.locality || '',
      donor_district: donor.district,
      donation_date: todayDate,
      connected_by: admin.name,
      cooldown_until: cooldownUntil,
      notes: `Fulfilled via Smart Matching system. Cooldown until ${cooldownUntil}`,
    });

    // 6. Log detailed activity
    await repository.logActivity(
      'Donor Connected & Request Completed',
      'blood_request',
      requestId,
      `Donor ${donor.full_name} (${donor.blood_group}) successfully linked to Patient ${bloodReq.patient_name} (${bloodReq.hospital_name}). Request marked Completed; Donor marked Busy (90-day cooldown until next donation).`,
      admin.name
    );

    return NextResponse.json({
      success: true,
      message: `Successfully connected ${donor.full_name} to patient ${bloodReq.patient_name}. Request marked Completed, and donor is set to Unavailable for the 90-day cooldown period.`,
      data: {
        donor: updatedDonor,
        request: updatedRequest,
        fulfillment,
      },
    });
  } catch (err: any) {
    console.error('Error connecting donor to request:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to connect donor to request.' },
      { status: 500 }
    );
  }
}
