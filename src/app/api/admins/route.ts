import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { getAdminSession } from '@/lib/auth/session';
import { AdminRole } from '@/types';

export async function GET() {
  const currentAdmin = await getAdminSession();
  if (!currentAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const admins = await repository.getAdmins();
    return NextResponse.json({ success: true, data: admins });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to retrieve administrators.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const currentAdmin = await getAdminSession();
  if (!currentAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only superadmin can create new administrator accounts
  if (currentAdmin.role !== 'superadmin') {
    return NextResponse.json(
      { error: 'Forbidden. Only Super Administrators can create other administrator accounts.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, password, role, nss_unit } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Administrator name is required.' }, { status: 400 });
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const validRoles: AdminRole[] = ['superadmin', 'coordinator', 'viewer', 'volunteer'];
    const assignedRole: AdminRole = validRoles.includes(role) ? role : 'viewer';

    const created = await repository.createAdmin(
      {
        name: name.trim(),
        email: email.trim(),
        password,
        role: assignedRole,
        nss_unit: nss_unit?.trim() || 'NSS Units 20 & 49',
      },
      currentAdmin.name
    );

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating administrator' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const currentAdmin = await getAdminSession();
  if (!currentAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (currentAdmin.role !== 'superadmin') {
    return NextResponse.json(
      { error: 'Forbidden. Only Super Administrators can delete administrator accounts.' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Admin ID required.' }, { status: 400 });
    }

    await repository.deleteAdmin(id, currentAdmin.name);
    return NextResponse.json({ success: true, message: 'Administrator removed successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error deleting administrator' }, { status: 400 });
  }
}
