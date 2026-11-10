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

  const donor = await repository.getDonorById(params.id);
  if (!donor) {
    return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: donor });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (admin.role === 'viewer') {
    return NextResponse.json(
      { error: 'Forbidden. View-only administrators cannot modify donor records.' },
      { status: 403 }
    );
  }

  try {
    const updates = await request.json();
    const updated = await repository.updateDonor(params.id, updates, admin.name);
    if (!updated) {
      return NextResponse.json({ error: 'Donor record not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update donor record.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (admin.role === 'viewer') {
    return NextResponse.json(
      { error: 'Forbidden. View-only administrators cannot delete donor records.' },
      { status: 403 }
    );
  }

  try {
    const deleted = await repository.deleteDonor(params.id, admin.name);
    if (!deleted) {
      return NextResponse.json({ error: 'Donor record not found or could not be deleted.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Donor record removed successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete donor record.' }, { status: 500 });
  }
}
