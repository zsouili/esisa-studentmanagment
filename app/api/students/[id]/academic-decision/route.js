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

    // Get all modules for the student's year/semester/filiere
    const modules = await prisma.module.findMany({
      where: {
        OR: [
          { filiere: 'ALL' },
          { filiere: student.department },
        ],
      },
      orderBy: { name: 'asc' },
    });

    // Get notes
    const notes = await prisma.note.findMany({
      where: { studentId },
      include: { module: true },
    });

    const notesMap = {};
    for (const n of notes) {
      notesMap[n.moduleId] = n;
    }

    let validatedCount = 0;
    let failedCount = 0;
    let rattrapageEligible = 0;
    let totalWeighted = 0;
    let totalCoeff = 0;

    const moduleResults = modules.map((m) => {
      const note = notesMap[m.id];
      if (!note) {
        return {
          id: m.id,
          name: m.name,
          code: m.code,
          coefficient: m.coefficient,
          grade: null,
          rattrapageGrade: null,
          effectiveGrade: null,
          status: 'no-grade',
        };
      }

      const effectiveGrade = Math.max(note.grade, note.rattrapageGrade || 0);
      totalWeighted += effectiveGrade * m.coefficient;
      totalCoeff += m.coefficient;

      let status;
      if (effectiveGrade >= 10) {
        status = 'validated';
        validatedCount++;
      } else if (note.rattrapageGrade != null) {
        status = 'failed-after-rattrapage';
        failedCount++;
      } else if (note.grade < 10) {
        status = 'rattrapage-eligible';
        rattrapageEligible++;
      } else {
        status = 'failed';
        failedCount++;
      }

      return {
        id: m.id,
        name: m.name,
        code: m.code,
        coefficient: m.coefficient,
        grade: note.grade,
        rattrapageGrade: note.rattrapageGrade,
        effectiveGrade,
        status,
      };
    });

    const average = totalCoeff > 0 ? Math.round((totalWeighted / totalCoeff) * 100) / 100 : 0;
    const totalModules = modules.length;

    let decision, decisionCode;
    if (notes.length === 0) {
      decision = 'En attente de notes';
      decisionCode = 'pending';
    } else if (rattrapageEligible > 0) {
      decision = 'Rattrapage requis';
      decisionCode = 'rattrapage';
    } else if (failedCount > 0) {
      decision = 'Ajourné';
      decisionCode = 'ajourne';
    } else if (validatedCount === totalModules && totalModules > 0) {
      decision = 'Admis';
      decisionCode = 'admis';
    } else if (average >= 10) {
      decision = 'Admis';
      decisionCode = 'admis';
    } else {
      decision = 'Ajourné';
      decisionCode = 'ajourne';
    }

    return NextResponse.json({
      student: { ...student, filiere: student.department },
      modules: moduleResults,
      average,
      validatedCount,
      failedCount,
      rattrapageEligible,
      totalModules,
      decision,
      decisionCode,
    });
  } catch {
    return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
  }
}
