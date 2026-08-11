
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendResponse } from '../utils/response';

export const CreateInspection = async (req: Request, res: Response) => {
  try {
    const { machine_id, result, notes } = req.body;

    if (!machine_id || !result || !notes) {
      sendResponse(res, 400, false, "Please enter the machine ID, result, and notes!");
      return;
    }

    const inspector_id = (req as any).user.id;

    const new_inspection = await (prisma as any).inspection.create({
      data: {
        machine_id,
        inspector_id,
        result,
        notes
      }
    });

    sendResponse(
      res, 
      201, 
      true, 
      "Inspection logged successfully!", 
      new_inspection
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const GetInspections = async (req: Request, res: Response) => {
  try {
    const all_inspections = await (prisma as any).inspection.findMany();

    sendResponse(
      res, 
      200, 
      true, 
      "Inspections retrieved successfully!", 
      all_inspections
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};
