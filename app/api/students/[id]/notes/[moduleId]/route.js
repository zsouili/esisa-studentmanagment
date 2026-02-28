import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id, moduleId } = await params;
    const studentId = Number(id);
    const modId = Number(moduleId);

    const body = await request.json();
    const grade = Number(body.grade);

    if (!Number.isFinite(grade) || grade < 0 || grade > 20) {
      return NextResponse.json({ message: 'La note doit être entre 0 et 20.' }, { status: 400 });
    }

    const note = await prisma.note.findUnique({
      where: { studentId_moduleId: { studentId, moduleId: modId } },
    });

    if (!note) {
      return NextResponse.json({ message: 'Note non trouvée.' }, { status: 404 });
    }

    const updated = await prisma.note.update({
      where: { studentId_moduleId: { studentId, moduleId: modId } },
      data: { rattrapageGrade: grade },
      include: { module: true },
    });

    return NextResponse.json({
      studentId: updated.studentId,
      moduleId: updated.moduleId,
      grade: updated.grade,
      rattrapageGrade: updated.rattrapageGrade,
      updatedAt: updated.updatedAt,
      moduleName: updated.module.name,
      moduleCode: updated.module.code,
      coefficient: updated.module.coefficient,
    });
  } catch {
    return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id, moduleId } = await params;
    const studentId = Number(id);
    const modId = Number(moduleId);

    await prisma.note.delete({
      where: { studentId_moduleId: { studentId, moduleId: modId } },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Note non trouvée.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
  }
}
