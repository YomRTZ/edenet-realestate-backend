
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  datasource: {
    // Prisma v7+ requires the connection URL to be configured via prisma.config.ts,
    // not via datasource.url inside the schema.
    url: process.env.DATABASE_URL,
  },
});

