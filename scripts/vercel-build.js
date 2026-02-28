// This script switches the Prisma schema to PostgreSQL before building on Vercel
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Switch provider to postgresql for Vercel
schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');

// Add binary targets for Vercel Lambda
schema = schema.replace(
  'provider      = "prisma-client-js"',
  'provider      = "prisma-client-js"\n  binaryTargets = ["native", "rhel-openssl-3.0.x"]'
);

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('✅ Prisma schema switched to PostgreSQL for Vercel build');
