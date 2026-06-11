import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const partsDir = path.join(cwd, 'prisma', 'schema.parts');
const outPath = path.join(cwd, 'prisma', 'schema.generated.prisma');

const header = `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT BY HAND.

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`;

const files = fs
  .readdirSync(partsDir)
  .filter((f) => f.endsWith('.prisma'))
  .sort();

const body = files
  .map((f) => fs.readFileSync(path.join(partsDir, f), 'utf8').trim())
  .filter(Boolean)
  .join('\n\n');

const final = `${header}\n\n${body}\n`;
fs.writeFileSync(outPath, final, 'utf8');

console.log('Generated Prisma schema ->', outPath);