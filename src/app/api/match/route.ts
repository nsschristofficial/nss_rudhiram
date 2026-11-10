import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { getAdminSession } from '@/lib/auth/session';
import { BloodGroup } from '@/types';
import { BLOOD_GROUPS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const blood_group = searchParams.get('blood_group') as BloodGroup;
  const district = searchParams.get('district') || undefined;
  const locality = searchParams.get('locality') || undefined;
  const availableOnly = searchParams.get('availableOnly') !== 'false';
  const requestId = searchParams.get('requestId') || undefined;

  if (!blood_group || !BLOOD_GROUPS.includes(blood_group)) {
    return NextResponse.json(
      { error: 'Valid blood group required for matching.' },
      { status: 400 }
    );
  }

  try {
    let requestContext = null;
    if (requestId) {
      requestContext = await repository.getBloodRequestById(requestId);
    }

    const matches = await repository.matchDonors({
      blood_group,
      district,
      locality,
      availableOnly,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...matches,
        requestContext,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error matching donors.' }, { status: 500 });
  }
}
