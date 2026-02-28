import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const module = await prisma.module.findUnique({ where: { id: Number(id) } });
    if (!module) {
      return NextResponse.json({ message: 'Module non trouvé.' }, { status: 404 });
    }
    return NextResponse.json(module);
  } catch {
    return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const moduleId = Number(id);
    const existing = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!existing) {
      return NextResponse.json({ message: 'Module non trouvé.' }, { status: 404 });
    }

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

    const updated = await prisma.module.update({
      where: { id: moduleId },
      data: { code, name, coefficient, year, semester, filiere },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Ce code module existe déjà.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.module.delete({ where: { id: Number(id) } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Module non trouvé.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
  }
}
