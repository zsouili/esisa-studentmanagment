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

    const records = await prisma.attendance.findMany({
      where: { studentId },
      include: { module: true },
      orderBy: { date: 'desc' },
    });

    const recordsList = records.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      moduleId: r.moduleId,
      date: r.date,
      status: r.status,
      moduleName: r.module.name,
    }));

    // Summary by module
    const summaryMap = {};
    for (const r of records) {
      if (!summaryMap[r.moduleId]) {
        summaryMap[r.moduleId] = { moduleName: r.module.name, total: 0, present: 0, absent: 0, late: 0 };
      }
      summaryMap[r.moduleId].total++;
      if (r.status === 'present') summaryMap[r.moduleId].present++;
      else if (r.status === 'absent') summaryMap[r.moduleId].absent++;
      else if (r.status === 'late') summaryMap[r.moduleId].late++;
    }

    return NextResponse.json({ records: recordsList, summary: Object.values(summaryMap) });
  } catch {
    return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const studentId = Number(id);
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json({ message: 'Étudiant non trouvé.' }, { status: 404 });
    }

    const body = await request.json();
    const moduleId = Number(body.moduleId);
    const date = String(body.date || '').trim();
    const status = String(body.status || '').trim();

    if (!moduleId || !date || !status) {
      return NextResponse.json({ message: 'Tous les champs sont requis.' }, { status: 400 });
    }

    if (!['present', 'absent', 'late'].includes(status)) {
      return NextResponse.json({ message: 'Statut invalide.' }, { status: 400 });
    }

    const record = await prisma.attendance.create({
      data: { studentId, moduleId, date, status },
      include: { module: true },
    });

    return NextResponse.json({
      id: record.id,
      studentId: record.studentId,
      moduleId: record.moduleId,
      date: record.date,
      status: record.status,
      moduleName: record.module.name,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
  }
}
