
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendResponse } from '../utils/response'; 


export const CreateMachine = async (req: Request, res: Response) => {
  try {
    const { name, type, serial_number, location, created_by_id } = req.body;

    if (!name || !type || !serial_number || !location || !created_by_id) {
      sendResponse(res, 400, false, "Please enter all details, including the staff ID!");
      return;
    }

    const new_machine = await prisma.machine.create({
      data: {
        name,
        type,
        serial_number,
        location,
        created_by_id 
      }
    });

    sendResponse(
      res, 
      201, 
      true, 
      "Machine registered successfully!", 
      new_machine
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};