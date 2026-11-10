import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { getAdminSession } from '@/lib/auth/session';
import { BLOOD_GROUPS } from '@/lib/constants';
import { isValidIndianMobile, cleanPhone } from '@/lib/utils';
import { BloodGroup, AvailabilityStatus } from '@/types';

// Rate limiting map for IP protection
const submissionLog = new Map<string, number>();

export async function GET(request: NextRequest) {
  // STRICT SECURITY: Only authenticated administrators may read donor records
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized. Donor records are strictly confidential and accessible only to authorised administrators.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;
  const blood_group = searchParams.get('blood_group') || undefined;
  const district = searchParams.get('district') || undefined;
  const availability = searchParams.get('availability') || undefined;

  try {
    const donors = await repository.getDonors({
      search,
      blood_group,
      district,
      availability,
    });
    return NextResponse.json({ success: true, data: donors });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to retrieve donor records.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Basic spam / abuse rate limit check
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
      full_name,
      age,
      gender,
      blood_group,
      mobile,
      email,
      district,
      locality,
      pincode,
      last_donation_date,
      availability,
      additional_information,
      consent,
    } = body;

    // 1. Mandatory Validations
    if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
      return NextResponse.json({ error: 'Please provide a valid full name (minimum 2 characters).' }, { status: 400 });
    }

    const parsedAge = parseInt(String(age), 10);
    if (isNaN(parsedAge) || parsedAge < 18) {
      return NextResponse.json(
        { error: 'Donors must be at least 18 years of age to register in accordance with blood donation regulations.' },
        { status: 400 }
      );
    }
    if (parsedAge > 65) {
      return NextResponse.json(
        { error: 'Upper age limit for voluntary blood donor registration is 65 years.' },
        { status: 400 }
      );
    }

    if (!blood_group || !BLOOD_GROUPS.includes(blood_group as BloodGroup)) {
      return NextResponse.json(
        { error: `Invalid blood group. Must be one of: ${BLOOD_GROUPS.join(', ')}` },
        { status: 400 }
      );
    }

    const cleanedMobile = cleanPhone(String(mobile || ''));
    if (!isValidIndianMobile(cleanedMobile)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.' },
        { status: 400 }
      );
    }

    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
      }
    }

    if (!district || district.trim() === '') {
      return NextResponse.json({ error: 'Please select your district.' }, { status: 400 });
    }

    if (!locality || locality.trim().length < 2) {
      return NextResponse.json({ error: 'Please provide your locality or place.' }, { status: 400 });
    }

    const cleanPin = String(pincode || '').replace(/[^0-9]/g, '');
    if (cleanPin.length !== 6) {
      return NextResponse.json({ error: 'Please enter a valid 6-digit PIN code.' }, { status: 400 });
    }

    if (!consent) {
      return NextResponse.json(
        { error: 'You must agree to the voluntary consent statement to register as a donor.' },
        { status: 400 }
      );
    }

    // Date validation
    let validLastDonation = null;
    if (last_donation_date && last_donation_date.trim() !== '') {
      const donationDate = new Date(last_donation_date);
      if (isNaN(donationDate.getTime()) || donationDate > new Date()) {
        return NextResponse.json(
          { error: 'Last donation date cannot be in the future.' },
          { status: 400 }
        );
      }
      validLastDonation = last_donation_date;
    }

    const validAvailability: AvailabilityStatus =
      availability === 'Busy' || availability === 'Inactive' ? availability : 'Available';

    const createdDonor = await repository.createDonor({
      full_name: full_name.trim(),
      age: parsedAge,
      gender: gender || 'Prefer not to say',
      blood_group: blood_group as BloodGroup,
      mobile: cleanedMobile,
      email: email ? email.trim().toLowerCase() : undefined,
      district: district.trim(),
      locality: locality.trim(),
      pincode: cleanPin,
      last_donation_date: validLastDonation,
      availability: validAvailability,
      additional_information: additional_information ? additional_information.trim() : '',
      consent: true,
    });

    // Note: NEVER return private database records or other donor info to the public user
    return NextResponse.json({
      success: true,
      message: 'Thank you! Your voluntary donor registration has been received successfully.',
      registrationId: createdDonor.id,
    });
  } catch (err: any) {
    if (err.message && err.message.includes('already registered')) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return NextResponse.json(
      { error: 'An error occurred while saving your registration. Please try again.' },
      { status: 500 }
    );
  }
}
