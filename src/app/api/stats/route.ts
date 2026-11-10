import { NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { getAdminSession } from '@/lib/auth/session';

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stats = await repository.getStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to compute statistics.' }, { status: 500 });
  }
}
