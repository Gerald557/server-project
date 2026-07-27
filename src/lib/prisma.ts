import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Initialize the pg connection pool using your .env connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Wrap the pool in Prisma's PG adapter to comply with Prisma v7
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });