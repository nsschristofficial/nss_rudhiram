import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { getAdminSession } from '@/lib/auth/session';

interface Params {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reqItem = await repository.getBloodRequestById(params.id);
  if (!reqItem) {
    return NextResponse.json({ error: 'Blood request not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: reqItem });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (admin.role === 'viewer') {
    return NextResponse.json(
      { error: 'Forbidden. View-only administrators cannot modify blood requests.' },
      { status: 403 }
    );
  }

  try {
    const updates = await request.json();
    const updated = await repository.updateBloodRequest(params.id, updates, admin.name);
    if (!updated) {
      return NextResponse.json({ error: 'Blood request not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update blood request.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (admin.role === 'viewer') {
    return NextResponse.json(
      { error: 'Forbidden. View-only administrators cannot delete blood requests.' },
      { status: 403 }
    );
  }

  try {
    const deleted = await repository.deleteBloodRequest(params.id, admin.name);
    if (!deleted) {
      return NextResponse.json({ error: 'Blood request not found or could not be deleted.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Blood request removed successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete blood request.' }, { status: 500 });
  }
}
