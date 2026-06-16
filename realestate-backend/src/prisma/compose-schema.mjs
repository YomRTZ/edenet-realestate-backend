import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const partsDir = path.join(__dirname, 'schema.parts');
const outPath = path.join(__dirname, 'schema.generated.prisma');

const header = `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT BY HAND.

generator client {
  provider = "prisma-client-js"

}

datasource db {
  provider = "postgresql"
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