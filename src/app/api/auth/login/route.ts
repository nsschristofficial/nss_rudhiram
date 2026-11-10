import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, setAdminSession } from '@/lib/auth/session';
import { repository } from '@/lib/db/repository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const admin = await verifyAdminCredentials(email, password);

    if (!admin) {
      await repository.logActivity(
        'Failed administrator login attempt',
        'auth',
        undefined,
        `Attempted login for: ${email}`
      );
      return NextResponse.json(
        { error: 'Invalid administrative credentials. Access restricted to authorised NSS administrators.' },
        { status: 401 }
      );
    }

    await setAdminSession(admin);
    await repository.logActivity(
      'Administrator logged in',
      'auth',
      admin.id,
      `${admin.name} (${admin.email}) logged in successfully`
    );

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        nss_unit: admin.nss_unit,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}
