import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const logAuditEvent = async (userId: number, action: string, details: string) => {
  try {
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "audit_logs" (user_id, action, details)
      VALUES (${userId}, ${action}, ${details})
    `);
  } catch (error) {
    console.error("Critical: Failed to write to background audit log:", error);
  }
};
