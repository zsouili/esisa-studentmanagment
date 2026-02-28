const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash('esisa123', 10);
  await prisma.user.upsert({
    where: { email: 'esisa@ac.ma' },
    update: {},
    create: {
      email: 'esisa@ac.ma',
      password: hashedPassword,
      name: 'Admin ESISA',
      role: 'admin',
    },
  });

  // Create sample filieres / modules
  const filieres = [
    'Ingénierie Logiciel',
    'SI - Intelligence Artificielle',
    'SI - Transformation Digitale',
  ];

  // Create some sample modules
  const sampleModules = [
    { code: 'IL-S1.1', name: 'Algorithmique', coefficient: 3, year: 1, semester: 1, filiere: 'ALL' },
    { code: 'IL-S1.2', name: 'Mathématiques', coefficient: 2, year: 1, semester: 1, filiere: 'ALL' },
    { code: 'IL-S1.3', name: 'Programmation C', coefficient: 3, year: 1, semester: 1, filiere: 'ALL' },
    { code: 'IL-S2.1', name: 'Bases de données', coefficient: 3, year: 1, semester: 2, filiere: 'ALL' },
    { code: 'IL-S2.2', name: 'Programmation Web', coefficient: 2, year: 1, semester: 2, filiere: 'ALL' },
    { code: 'IL-S3.1', name: 'Java', coefficient: 3, year: 2, semester: 3, filiere: 'Ingénierie Logiciel' },
    { code: 'IA-S3.1', name: 'Machine Learning', coefficient: 3, year: 2, semester: 3, filiere: 'SI - Intelligence Artificielle' },
  ];

  for (const mod of sampleModules) {
    await prisma.module.upsert({
      where: { code: mod.code },
      update: {},
      create: mod,
    });
  }

  // Create sample students
  const sampleStudents = [
    { firstName: 'Zayd', lastName: 'Swy', email: 'zayd@esisa.ac.ma', department: 'Ingénierie Logiciel', year: 1, semester: 1 },
    { firstName: 'Ahmed', lastName: 'Bennani', email: 'ahmed@esisa.ac.ma', department: 'SI - Intelligence Artificielle', year: 1, semester: 1 },
    { firstName: 'Sara', lastName: 'El Amrani', email: 'sara@esisa.ac.ma', department: 'SI - Transformation Digitale', year: 2, semester: 3 },
  ];

  for (const student of sampleStudents) {
    await prisma.student.upsert({
      where: { email: student.email },
      update: {},
      create: student,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
