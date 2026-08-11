
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendResponse } from '../utils/response';

const db = prisma as any;

export const CreateFault = async (req: Request, res: Response) => {
  try {
    const { machine_id, fault_description, severity, recommended_action } = req.body;

    if (!machine_id || !fault_description || !severity || !recommended_action) {
      sendResponse(res, 400, false, "Please enter all fault details!");
      return;
    }

    const parsed_machine_id = typeof machine_id === 'string' ? parseInt(machine_id) : machine_id;
    const reporter_id = (req as any).user.id;

    const new_fault = await prisma.fault.create({
      data: {
        machine_id: parsed_machine_id,
        fault_description,
        severity,
        reported_by_id: reporter_id,
        recommended_action
      }
    });

    sendResponse(
      res,
      201,
      true,
      "Fault reported successfully!",
      new_fault
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

// 1. Controller function named in PascalCase
export const GetFaults = async (req: Request, res: Response) => {
  try {
    // 2. Variable name in snake_case: all_faults
    const all_faults = await prisma.fault.findMany();

    sendResponse(res, 200, true, "Faults retrieved successfully!", all_faults);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};
