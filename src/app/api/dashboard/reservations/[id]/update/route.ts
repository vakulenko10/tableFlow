import { prisma } from '@/lib/db';
import { authConfig } from '@/lib/auth.config';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authConfig);
  const allowedAdmins = (process.env.ADMIN_EMAILS ?? '').split(',');

  if (!session || !allowedAdmins.includes(session.user?.email ?? '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();

  const updated = await prisma.reservation.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json(updated);
}
