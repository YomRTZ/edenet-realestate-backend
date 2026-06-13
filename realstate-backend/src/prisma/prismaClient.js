import pkg from '@prisma/client';

const { PrismaClient } = pkg;

// Central Prisma singleton.
// This repo expects DATABASE_URL to be present via .env and injected by src/config/env.js.
// Some Prisma versions/runtimes require passing datasource options at construction time.
let prisma;

export function getPrisma() {
  if (prisma) return prisma;

  if (!process.env.DATABASE_URL) {
    throw new Error('Missing required environment variable: DATABASE_URL');
  }

  prisma = new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL },
    },
    // Some Prisma versions require/benefit from explicitly setting a value
    // for `log` instead of relying on defaults (no-op if unsupported).
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });


  return prisma;
}

