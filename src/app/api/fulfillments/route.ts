import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { getAdminSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const blood_group = searchParams.get('blood_group') || undefined;
    const district = searchParams.get('district') || undefined;
    const hospital_name = searchParams.get('hospital_name') || undefined;

    const fulfillments = await repository.getFulfillments({
      search,
      blood_group,
      district,
      hospital_name,
    });

    return NextResponse.json({
      success: true,
      count: fulfillments.length,
      data: fulfillments,
    });
  } catch (err: any) {
    console.error('Failed to fetch fulfillments:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch fulfillments' },
      { status: 500 }
    );
  }
}
