import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendResponse } from '../utils/response';

export const GetAuditLogs = async (req: Request, res: Response) => {
  try {

    const registered_logs = await (prisma as typeof prisma & {
      auditLog: {
        findMany: (args: { orderBy: { created_at: 'desc' } }) => Promise<unknown[]>;
      };
    }).auditLog.findMany({
      orderBy: { created_at: 'desc' }
    });

    sendResponse(
      res, 
      200, 
      true, 
      "Chronological audit logs retrieved successfully!", 
      registered_logs
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};
