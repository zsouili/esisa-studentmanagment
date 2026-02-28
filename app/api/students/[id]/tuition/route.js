import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const studentId = Number(id);
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json({ message: 'Étudiant non trouvé.' }, { status: 404 });
    }

    const tuition = await prisma.tuition.findUnique({ where: { studentId } });

    return NextResponse.json(
      tuition
        ? {
            studentId: tuition.studentId,
            totalFees: tuition.totalFees,
            paidFees: tuition.paidFees,
            dueFees: Math.round((tuition.totalFees - tuition.paidFees) * 100) / 100,
            updatedAt: tuition.updatedAt,
          }
        : { studentId, totalFees: 0, paidFees: 0, dueFees: 0, updatedAt: null }
    );
  } catch {
    return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const studentId = Number(id);
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json({ message: 'Étudiant non trouvé.' }, { status: 404 });
    }

    const body = await request.json();
    const totalFees = Number(body.totalFees);
    const paidFees = Number(body.paidFees);

    if (!Number.isFinite(totalFees) || totalFees < 0) {
      return NextResponse.json({ message: 'Frais totaux invalides.' }, { status: 400 });
    }
    if (!Number.isFinite(paidFees) || paidFees < 0) {
      return NextResponse.json({ message: 'Frais payés invalides.' }, { status: 400 });
    }
    if (paidFees > totalFees) {
      return NextResponse.json({ message: 'Les frais payés ne peuvent pas dépasser les frais totaux.' }, { status: 400 });
    }

    const tuition = await prisma.tuition.upsert({
      where: { studentId },
      update: { totalFees, paidFees },
      create: { studentId, totalFees, paidFees },
    });

    return NextResponse.json({
      studentId: tuition.studentId,
      totalFees: tuition.totalFees,
      paidFees: tuition.paidFees,
      dueFees: Math.round((tuition.totalFees - tuition.paidFees) * 100) / 100,
      updatedAt: tuition.updatedAt,
    });
  } catch {
    return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
  }
}
