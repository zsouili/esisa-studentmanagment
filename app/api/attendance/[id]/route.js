import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.attendance.delete({ where: { id: Number(id) } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Enregistrement non trouvé.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
  }
}
