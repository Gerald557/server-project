
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendResponse } from '../utils/response';

export const CreateMachine = async (req: Request, res: Response) => {
  try {
    const { name, type, serial_number, location } = req.body;

    if (!name || !type || !serial_number || !location) {
      sendResponse(res, 400, false, "Please enter all required machine details!");
      return;
    }

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
        created_by_id: staff_id
      }
    });

    sendResponse(
      res, 
      201, 
      true, 
      "Machine registered securely!", 
      new_machine
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const GetMachines = async (req: Request, res: Response) => {
  try {
    const registered_machines = await prisma.machine.findMany();

    sendResponse(
      res, 
      200, 
      true, 
      "Machines retrieved successfully!", 
      registered_machines
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};
