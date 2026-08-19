import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendResponse } from '../utils/response';
import { create_work_order_schema } from '../validators/work_order.validator';
import nodemailer from 'nodemailer'; 

const sendAssignmentEmail = async (email: string, name: string, description: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"Maintenance System" ',
      to: email,
      subject: "New Work Order Task Assigned",
      html: `
        Hello ${name},
        You have been officially assigned to a new mechanical maintenance work order:
        
          "${description}"
        
        Please log into your panel to inspect the machine and update the work order status once you begin your repair.
        Thank you!
      `
    });
  } catch (error) {
    console.error("Failed to send assignment email:", error);
  }
};


export const CreateWorkOrder = async (req: Request, res: Response) => {
  try {
    const scan_result = create_work_order_schema.safeParse(req.body);

    if (!scan_result.success) {
      const first_error_message = scan_result.error.issues[0].message;
      sendResponse(res, 422, false, first_error_message);
      return;
    }

    const { machine_id, fault_id, description, assigned_to_id } = scan_result.data;

    if (fault_id) {
      const linked_fault = await prisma.fault.findUnique({
        where: { id: fault_id }
      });

      if (!linked_fault) {
        sendResponse(res, 404, false, "The linked fault record does not exist!");
        return;
      }

      if (linked_fault.status === "draft") {
        sendResponse(
          res, 
          422, 
          false, 
          "Cannot issue a work order! The linked fault is still a draft and has not been approved by an inspector."
        );
        return;
      }
    }

    const creator_id = (req as any).user.id;

    const new_work_order = await prisma.workOrder.create({
      data: {
        machine_id,
        fault_id,
        description,
        assigned_to_id,
        created_by_id: creator_id,
        status: "pending"
      }
    });

    if (assigned_to_id) {
      const staff_user = await prisma.user.findFirst({
        where: { id: assigned_to_id }
      });
      if (staff_user) {
        await sendAssignmentEmail(staff_user.email, staff_user.name, description);
      }
    }

    sendResponse(
      res, 
      201, 
      true, 
      "Work order issued successfully and technician notified!", 
      new_work_order
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};


export const GetWorkOrders = async (req: Request, res: Response) => {
  try {
    const all_work_orders = await prisma.workOrder.findMany();
    sendResponse(res, 200, true, "Work orders retrieved successfully!", all_work_orders);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};


export const UpdateWorkOrderStatus = async (req: Request, res: Response) => {
  try {
    const parsed_id = parseInt(req.params.id as string);

    if (isNaN(parsed_id)) {
      sendResponse(res, 422, false, "Invalid work order ID!");
      return;
    }

    const { status, assigned_to_id } = req.body;

    const existing_work_order = await prisma.workOrder.findUnique({
      where: { id: parsed_id }
    });

    if (!existing_work_order) {
      sendResponse(res, 404, false, "Work order not found!");
      return;
    }

    const updated_work_order = await prisma.workOrder.update({
      where: { id: parsed_id },
      data: {
        status: status !== undefined ? status : existing_work_order.status,
        assigned_to_id: assigned_to_id !== undefined ? assigned_to_id : existing_work_order.assigned_to_id,
        updated_at: new Date()
      }
    });

    if (assigned_to_id && assigned_to_id !== existing_work_order.assigned_to_id) {
      const staff_user = await prisma.user.findFirst({
        where: { id: assigned_to_id }
      });
      if (staff_user) {
        await sendAssignmentEmail(
          staff_user.email, 
          staff_user.name, 
          updated_work_order.description
        );
      }
    }

    sendResponse(
      res, 
      200, 
      true, 
      "Work order updated successfully and technician notified!", 
      updated_work_order
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};
