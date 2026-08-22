
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendResponse } from '../utils/response';
import { create_machine_schema } from '../validators/machine'
import { logAuditEvent } from '../utils/audit';

export const CreateMachine = async (req: Request, res: Response) => {
  try {
    const scan_result = create_machine_schema.safeParse(req.body)
    if (!scan_result.success) {
      const first_error_message = scan_result.error.issues[0].message;
      // Changed status code from 400 to 422!
      sendResponse(res, 422, false, first_error_message);
      return;
    }
    const { name, type, serial_number, location } = scan_result.data;

    const staff_id = (req as any).user?.id;
    if (!staff_id) {
      sendResponse(res, 401, false, "Unauthorized access.");
      return;
    }

    const new_machine = await prisma.machine.create({
      data: {
        name,
        type,
        serial_number,
        location,
        created_by_id: staff_id,
        updated_at: new Date()
      }
    });
    
    await logAuditEvent(
      staff_id, 
      "CREATE_MACHINE", 
      `Staff member ID ${staff_id} successfully registered new machine: ${new_machine.name} (Serial: ${new_machine.serial_number})`
    );

    sendResponse(
      res, 
      201, 
      true, 
      "Machine registered securely with schema validation!", 
      new_machine
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const GetMachines = async (req: Request, res: Response) => {
  try {
    const registered_machines = await prisma.machine.findMany();
    sendResponse(res, 200, true, "Machines retrieved successfully!", registered_machines);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const UpdateMachine = async (req: Request, res: Response) => {
  try {
    const parsed_id = parseInt(req.params.id as string);
    if (isNaN(parsed_id)) {
      sendResponse(res, 400, false, "Invalid machine ID!");
      return;
    }

    const existing_machine = await prisma.machine.findUnique({
      where: { id: parsed_id }
    });

    if (!existing_machine) {
      sendResponse(res, 404, false, "Machine not found!");
      return;
    }

    const { name, type, serial_number, location, status } = req.body;
    const updated_machine = await prisma.machine.update({
      where: { id: parsed_id },
      data: {
        name: name !== undefined ? name : existing_machine.name,
        type: type !== undefined ? type : existing_machine.type,
        serial_number: serial_number !== undefined ? serial_number : existing_machine.serial_number,
        location: location !== undefined ? location : existing_machine.location,
        status: status !== undefined ? status : existing_machine.status,
        updated_at: new Date()
      }
    });

    sendResponse(res, 200, true, "Machine updated successfully!", updated_machine);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};