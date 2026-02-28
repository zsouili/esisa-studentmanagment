import { NextResponse } from 'next/server';

export async function GET() {
  const filieres = [
    'Ingénierie Logiciel',
    'SI - Intelligence Artificielle',
    'SI - Transformation Digitale',
  ];
  return NextResponse.json(filieres);
}
