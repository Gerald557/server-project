import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendResponse } from '../utils/response';

export const CreateFault = async (req: Request, res: Response) => {
  try {
    const { machine_id, inspection_id, fault_description, severity, recommended_action } = req.body;

    if (!machine_id || !fault_description || !severity || !recommended_action) {
      sendResponse(res, 422, false, "Please enter all fault details!");
      return;
    }

    const parsed_machine_id = typeof machine_id === 'string' ? parseInt(machine_id) : machine_id;
    
    const parsed_inspection_id = inspection_id ? (typeof inspection_id === 'string' ? parseInt(inspection_id) : inspection_id) : null;

    const reporter_id = (req as any).user.id;

    const new_fault = await prisma.fault.create({
      data: {
        machine_id: parsed_machine_id,
        inspection_id: parsed_inspection_id,
        fault_description,
        severity,
        reported_by_id: reporter_id,
        recommended_action,
        status: "draft"
      }
    });

    sendResponse(
      res, 
      201, 
      true, 
      "Fault report logged as a draft!", 
      new_fault
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const ValidateFault = async (req: Request, res: Response) => {
  try {
    const parsed_id = parseInt(req.params.id as string);

    if (isNaN(parsed_id)) {
      sendResponse(res, 422, false, "Invalid fault ID!");
      return;
    }

    const { status, inspection_id } = req.body;

    if (status !== "open" && status !== "rejected") {
      sendResponse(res, 422, false, "Invalid status change! Please approve ('open') or deny ('rejected') the fault.");
      return;
    }

    const existing_fault = await prisma.fault.findUnique({
      where: { id: parsed_id }
    });

    if (!existing_fault) {
      sendResponse(res, 404, false, "Fault record not found!");
      return;
    }

    const parsed_inspection_id = inspection_id ? (typeof inspection_id === 'string' ? parseInt(inspection_id) : inspection_id) : null;

    const validated_fault = await prisma.fault.update({
      where: { id: parsed_id },
      data: {
        status: status,
        inspection_id: parsed_inspection_id,
        updated_at: new Date()
      }
    });

    sendResponse(
      res, 
      200, 
      true, 
      `Fault status updated successfully to ${status}!`, 
      validated_fault
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const GetFaults = async (req: Request, res: Response) => {
  try {
    const all_faults = await prisma.fault.findMany();
    sendResponse(res, 200, true, "Faults retrieved successfully!", all_faults);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};
