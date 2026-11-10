import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/session';

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: admin,
  });
}
