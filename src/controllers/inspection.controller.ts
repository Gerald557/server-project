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
    const parsed_machine_id = typeof machine_id === 'string' ? parseInt(machine_id) : machine_id;

    const inspector_id = (req as any).user.id;

    const new_inspection = await prisma.inspection.create({
      data: {
        machine_id: parsed_machine_id,
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
 const all_inspections = await prisma.inspection.findMany();

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

export const UpdateInspection = async (req: Request, res: Response) => {
  try {
    const parsed_id = parseInt(req.params.id as string);

    if (isNaN(parsed_id)) {
      sendResponse(res, 400, false, "Invalid inspection ID!");
      return;
    }

    const existing_inspection = await prisma.inspection.findUnique({
      where: { id: parsed_id }
    });

    if (!existing_inspection) {
      sendResponse(res, 404, false, "Inspection record not found!");
      return;
    }

    const { result, notes } = req.body;

    const updated_inspection = await prisma.inspection.update({
      where: { id: parsed_id },
      data: {
        result: result !== undefined ? result : existing_inspection.result,
        notes: notes !== undefined ? notes : existing_inspection.notes,
        updated_at: new Date()
      }
    });

    sendResponse(
      res, 
      200, 
      true, 
      "Inspection updated successfully!", 
      updated_inspection
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};
