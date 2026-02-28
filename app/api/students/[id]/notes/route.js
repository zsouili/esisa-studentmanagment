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

    const notes = await prisma.note.findMany({
      where: { studentId },
      include: { module: true },
      orderBy: { module: { name: 'asc' } },
    });

    const notesList = notes.map((n) => ({
      studentId: n.studentId,
      moduleId: n.moduleId,
      grade: n.grade,
      rattrapageGrade: n.rattrapageGrade,
      updatedAt: n.updatedAt,
      moduleName: n.module.name,
      moduleCode: n.module.code,
      coefficient: n.module.coefficient,
    }));

    let average = 0;
    if (notes.length > 0) {
      const totalWeighted = notes.reduce((sum, n) => {
        const effective = Math.max(n.grade, n.rattrapageGrade || 0);
        return sum + effective * n.module.coefficient;
      }, 0);
      const totalCoeff = notes.reduce((sum, n) => sum + n.module.coefficient, 0);
      average = totalCoeff > 0 ? Math.round((totalWeighted / totalCoeff) * 100) / 100 : 0;
    }

    return NextResponse.json({ notes: notesList, average });
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
    const grade = Number(body.grade);

    if (!Number.isInteger(moduleId) || moduleId <= 0) {
      return NextResponse.json({ message: 'Sélectionnez un module valide.' }, { status: 400 });
    }

    if (!Number.isFinite(grade) || grade < 0 || grade > 20) {
      return NextResponse.json({ message: 'La note doit être entre 0 et 20.' }, { status: 400 });
    }

    const moduleExists = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!moduleExists) {
      return NextResponse.json({ message: 'Module non trouvé.' }, { status: 404 });
    }

    const note = await prisma.note.upsert({
      where: { studentId_moduleId: { studentId, moduleId } },
      update: { grade },
      create: { studentId, moduleId, grade },
    });

    const noteWithModule = await prisma.note.findUnique({
      where: { studentId_moduleId: { studentId, moduleId } },
      include: { module: true },
    });

    return NextResponse.json(
      {
        studentId: noteWithModule.studentId,
        moduleId: noteWithModule.moduleId,
        grade: noteWithModule.grade,
        rattrapageGrade: noteWithModule.rattrapageGrade,
        updatedAt: noteWithModule.updatedAt,
        moduleName: noteWithModule.module.name,
        moduleCode: noteWithModule.module.code,
        coefficient: noteWithModule.module.coefficient,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
  }
}
