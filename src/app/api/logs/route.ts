import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { getAdminSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  try {
    const logs = await repository.getActivityLogs(limit);
    return NextResponse.json({ success: true, data: logs });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to retrieve activity logs.' }, { status: 500 });
  }
}
