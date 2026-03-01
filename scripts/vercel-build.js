// This script ensures the Prisma schema is set to PostgreSQL before building on Vercel
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Switch provider to postgresql for Vercel (only if still sqlite)
if (schema.includes('provider = "sqlite"')) {
  schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
}

// Add binary targets for Vercel Lambda (only if not already present)
if (!schema.includes('binaryTargets')) {
  schema = schema.replace(
    'provider      = "prisma-client-js"',
    'provider      = "prisma-client-js"\n  binaryTargets = ["native", "rhel-openssl-3.0.x"]'
  );
}

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('✅ Prisma schema ready for Vercel build');
