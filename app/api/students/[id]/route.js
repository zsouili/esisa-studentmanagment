import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const student = await prisma.student.findUnique({ where: { id: Number(id) } });
    if (!student) {
      return NextResponse.json({ message: 'Étudiant non trouvé.' }, { status: 404 });
    }
    return NextResponse.json({ ...student, filiere: student.department });
  } catch {
    return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const studentId = Number(id);
    const existing = await prisma.student.findUnique({ where: { id: studentId } });
    if (!existing) {
      return NextResponse.json({ message: 'Étudiant non trouvé.' }, { status: 404 });
    }

    const body = await request.json();
    const firstName = String(body.firstName || '').trim();
    const lastName = String(body.lastName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const department = String(body.filiere || body.department || '').trim();
    const year = Number(body.year);
    const semester = Number(body.semester || 1);

    if (!firstName || !lastName || !email || !department) {
      return NextResponse.json({ message: 'Tous les champs sont requis.' }, { status: 400 });
    }

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { firstName, lastName, email, department, year, semester },
    });

    return NextResponse.json({ ...updated, filiere: updated.department });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Un étudiant avec cet email existe déjà.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.student.delete({ where: { id: Number(id) } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Étudiant non trouvé.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
  }
}
