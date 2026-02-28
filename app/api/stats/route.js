import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const studentsCount = await prisma.student.count();
    const modulesCount = await prisma.module.count();
    const notesCount = await prisma.note.count();
    const absencesCount = await prisma.attendance.count({ where: { status: 'absent' } });

    return NextResponse.json({
      students: studentsCount,
      modules: modulesCount,
      notes: notesCount,
      absences: absencesCount,
    });
  } catch {
    return NextResponse.json({ students: 0, modules: 0, notes: 0, absences: 0 });
  }
}
