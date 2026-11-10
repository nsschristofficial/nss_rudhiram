import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { getAdminSession } from '@/lib/auth/session';
import { BLOOD_GROUPS } from '@/lib/constants';
import { isValidIndianMobile, cleanPhone } from '@/lib/utils';
import { BloodGroup, RequestUrgency } from '@/types';

const submissionLog = new Map<string, number>();

export async function GET(request: NextRequest) {
  // STRICT SECURITY: Only authenticated administrators may read blood requests
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized. Blood requests contain sensitive patient information and are accessible only to authorised administrators.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;
  const blood_group = searchParams.get('blood_group') || undefined;
  const district = searchParams.get('district') || undefined;
  const urgency = searchParams.get('urgency') || undefined;
  const status = searchParams.get('status') || undefined;

  try {
    const requests = await repository.getBloodRequests({
      search,
      blood_group,
      district,
      urgency,
      status,
    });
    return NextResponse.json({ success: true, data: requests });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to retrieve blood requests.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'local';
  const lastTime = submissionLog.get(ip);
  const now = Date.now();
  if (lastTime && now - lastTime < 800) {
    return NextResponse.json(
      { error: 'Please wait a moment before submitting again.' },
      { status: 429 }
    );
  }
  submissionLog.set(ip, now);

  try {
    const body = await request.json();
    const {
      patient_name,
      contact_person,
      contact_number,
      blood_group,
      units_required,
      hospital_name,
      hospital_location,
      district,
      required_date,
      urgency,
      additional_information,
    } = body;

    if (!patient_name || typeof patient_name !== 'string' || patient_name.trim().length < 2) {
      return NextResponse.json({ error: 'Please provide the patient name.' }, { status: 400 });
    }

    if (!contact_person || typeof contact_person !== 'string' || contact_person.trim().length < 2) {
      return NextResponse.json({ error: 'Please provide the contact person name.' }, { status: 400 });
    }

    const cleanedMobile = cleanPhone(String(contact_number || ''));
    if (!isValidIndianMobile(cleanedMobile)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian contact number.' },
        { status: 400 }
      );
    }

    if (!blood_group || !BLOOD_GROUPS.includes(blood_group as BloodGroup)) {
      return NextResponse.json(
        { error: `Invalid blood group. Must be one of: ${BLOOD_GROUPS.join(', ')}` },
        { status: 400 }
      );
    }

    const units = parseInt(String(units_required), 10);
    if (isNaN(units) || units < 1 || units > 50) {
      return NextResponse.json(
        { error: 'Units required must be between 1 and 50.' },
        { status: 400 }
      );
    }

    if (!hospital_name || hospital_name.trim().length < 2) {
      return NextResponse.json({ error: 'Please provide the hospital name.' }, { status: 400 });
    }

    if (!hospital_location || hospital_location.trim().length < 2) {
      return NextResponse.json({ error: 'Please provide the hospital city / location.' }, { status: 400 });
    }

    if (!district || district.trim() === '') {
      return NextResponse.json({ error: 'Please select the hospital district.' }, { status: 400 });
    }

    if (!required_date) {
      return NextResponse.json({ error: 'Please specify the date blood is required.' }, { status: 400 });
    }

    const reqDate = new Date(required_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(reqDate.getTime()) || reqDate < today) {
      return NextResponse.json({ error: 'The required date cannot be in the past.' }, { status: 400 });
    }

    const validUrgency: RequestUrgency =
      urgency === 'Emergency' || urgency === 'Urgent' ? urgency : 'Normal';

    const created = await repository.createBloodRequest({
      patient_name: patient_name.trim(),
      contact_person: contact_person.trim(),
      contact_number: cleanedMobile,
      blood_group: blood_group as BloodGroup,
      units_required: units,
      hospital_name: hospital_name.trim(),
      hospital_location: hospital_location.trim(),
      district: district.trim(),
      required_date,
      urgency: validUrgency,
      additional_information: additional_information ? additional_information.trim() : '',
      status: 'Pending',
    });

    return NextResponse.json({
      success: true,
      message: 'Blood request submitted successfully. The NSS RUDHIRAM team has been notified.',
      requestId: created.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'An error occurred while submitting your blood request. Please try again.' },
      { status: 500 }
    );
  }
}
