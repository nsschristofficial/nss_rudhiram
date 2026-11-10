import { NextResponse } from 'next/server';
import { clearAdminSession, getAdminSession } from '@/lib/auth/session';
import { repository } from '@/lib/db/repository';

export async function POST() {
  try {
    const admin = await getAdminSession();
    if (admin) {
      await repository.logActivity(
        'Administrator logged out',
        'auth',
        admin.id,
        `${admin.name} logged out`
      );
    }
    await clearAdminSession();
    return NextResponse.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to log out' }, { status: 500 });
  }
}
