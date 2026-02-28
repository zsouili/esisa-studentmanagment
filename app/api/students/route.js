import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { id: 'desc' },
      include: {
        notes: {
          include: { module: true },
        },
        tuition: true,
      },
    });

    const result = students.map((s) => {
      let average = 0;
      if (s.notes.length > 0) {
        const totalWeighted = s.notes.reduce((sum, n) => {
          const effective = Math.max(n.grade, n.rattrapageGrade || 0);
          return sum + effective * n.module.coefficient;
        }, 0);
        const totalCoeff = s.notes.reduce((sum, n) => sum + n.module.coefficient, 0);
        average = totalCoeff > 0 ? Math.round((totalWeighted / totalCoeff) * 100) / 100 : 0;
      }
      return {
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        department: s.department,
        filiere: s.department,
        year: s.year,
        semester: s.semester,
        createdAt: s.createdAt,
        average,
        totalFees: s.tuition?.totalFees || 0,
        paidFees: s.tuition?.paidFees || 0,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
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

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json({ message: 'Veuillez fournir un email valide.' }, { status: 400 });
    }

    if (!Number.isInteger(year) || year < 1 || year > 5) {
      return NextResponse.json({ message: "L'année doit être entre 1 et 5." }, { status: 400 });
    }

    const student = await prisma.student.create({
      data: { firstName, lastName, email, department, year, semester },
    });

    return NextResponse.json({ ...student, filiere: student.department }, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Un étudiant avec cet email existe déjà.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Erreur lors de la création.' }, { status: 500 });
  }
}
