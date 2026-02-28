import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const semester = searchParams.get('semester');

    const where = {};
    if (year) where.year = Number(year);
    if (semester) where.semester = Number(semester);

    const modules = await prisma.module.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(modules);
  } catch {
    return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const code = String(body.code || '').trim();
    const name = String(body.name || '').trim();
    const coefficient = Number(body.coefficient);
    const year = Number(body.year || 1);
    const semester = Number(body.semester || 1);
    const filiere = String(body.filiere || 'ALL').trim();

    if (!code || !name) {
      return NextResponse.json({ message: 'Code et nom sont requis.' }, { status: 400 });
    }

    if (!Number.isFinite(coefficient) || coefficient <= 0) {
      return NextResponse.json({ message: 'Le coefficient doit être positif.' }, { status: 400 });
    }

    const module = await prisma.module.create({
      data: { code, name, coefficient, year, semester, filiere },
    });

    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Ce module existe déjà.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
  }
}
