import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendResponse } from '../utils/response';
import { create_work_order_schema } from '../validators/work_order.validator';

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

    const new_work_order = await (prisma as any).workOrder.create({
      data: {
        machine_id,
        fault_id,
        description,
        assigned_to_id,
        created_by_id: creator_id,
        status: "pending"
      }
    });

    sendResponse(
      res, 
      201, 
      true, 
      "Work order issued successfully!", 
      new_work_order
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

// 2. Retrieve All Work Orders
export const GetWorkOrders = async (req: Request, res: Response) => {
  try {
    const all_work_orders = await (prisma as any).workOrder.findMany();
    sendResponse(res, 200, true, "Work orders retrieved successfully!", all_work_orders);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

// 3. Update Status (e.g., pending -> assigned -> completed)
export const UpdateWorkOrderStatus = async (req: Request, res: Response) => {
  try {
    const parsed_id = parseInt(req.params.id as string);

    if (isNaN(parsed_id)) {
      sendResponse(res, 422, false, "Invalid work order ID!");
      return;
    }

    const { status, assigned_to_id } = req.body;

    const existing_work_order = await (prisma as any).workOrder.findUnique({
      where: { id: parsed_id }
    });

    if (!existing_work_order) {
      sendResponse(res, 404, false, "Work order not found!");
      return;
    }

    const updated_work_order = await (prisma as any).workOrder.update({
      where: { id: parsed_id },
      data: {
        status: status !== undefined ? status : existing_work_order.status,
        assigned_to_id: assigned_to_id !== undefined ? assigned_to_id : existing_work_order.assigned_to_id,
        updated_at: new Date()
      }
    });

    sendResponse(
      res, 
      200, 
      true, 
      "Work order updated successfully!", 
      updated_work_order
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};
