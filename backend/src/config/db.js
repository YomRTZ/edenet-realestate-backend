// src/config/db.js
// Singleton Prisma client — import this everywhere instead of creating new PrismaClient()

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
