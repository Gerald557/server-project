import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendResponse } from '../utils/response';
import { create_invoice_schema, update_invoice_status_schema } from '../validators/invoice.validator';

const prismaClient = prisma as any;

export const CreateInvoice = async (req: Request, res: Response) => {
  try {
    const scan_result = create_invoice_schema.safeParse(req.body);

    if (!scan_result.success) {
      const first_error_message = scan_result.error.issues[0].message;
      sendResponse(res, 422, false, first_error_message);
      return;
    }

    const { work_order_id, labor_cost } = scan_result.data;

    const work_order = await prismaClient.workOrder.findUnique({
      where: { id: work_order_id }
    });

    if (!work_order) {
      sendResponse(res, 404, false, "The target work order record does not exist!");
      return;
    }

    const existing_invoice = await prismaClient.invoice.findUnique({
      where: { work_order_id }
    });

    if (existing_invoice) {
      sendResponse(res, 400, false, "An invoice has already been generated for this work order!");
      return;
    }

    const parts_consumed = await prismaClient.workOrderPart.findMany({
      where: { work_order_id }
    });

    let calculated_parts_cost = 0;

    for (const ticket of parts_consumed) {
      const part = await prismaClient.sparePart.findUnique({
        where: { id: ticket.spare_part_id }
      });
      if (part) {
        calculated_parts_cost += part.unit_cost * ticket.quantity_used;
      }
    }

    const final_labor_cost = labor_cost !== undefined ? labor_cost : 100.00;
    const final_total = final_labor_cost + calculated_parts_cost;

    const new_invoice = await prismaClient.invoice.create({
      data: {
        work_order_id,
        labor_cost: final_labor_cost,
        parts_cost: calculated_parts_cost,
        total_amount: final_total,
        status: "draft"
      }
    });

    sendResponse(
      res, 
      201, 
      true, 
      "Invoice compiled and generated successfully!", 
      new_invoice
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const GetInvoices = async (req: Request, res: Response) => {
  try {
    const all_invoices = await prismaClient.invoice.findMany();
    sendResponse(res, 200, true, "Invoices retrieved successfully!", all_invoices);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const UpdateInvoiceStatus = async (req: Request, res: Response) => {
  try {
    const parsed_id = parseInt(req.params.id as string);

    if (isNaN(parsed_id)) {
      sendResponse(res, 422, false, "Invalid invoice ID!");
      return;
    }

    const scan_result = update_invoice_status_schema.safeParse(req.body);

    if (!scan_result.success) {
      sendResponse(res, 400, false, "Invalid invoice status payload!");
      return;
    }

    const { status } = scan_result.data;

    const existing_invoice = await prismaClient.invoice.findUnique({
      where: { id: parsed_id }
    });

    if (!existing_invoice) {
      sendResponse(res, 404, false, "Invoice record not found!");
      return;
    }

    const updated_invoice = await prismaClient.invoice.update({
      where: { id: parsed_id },
      data: {
        status,
        updated_at: new Date()
      }
    });

    sendResponse(
      res, 
      200, 
      true, 
      `Invoice status updated successfully to ${status}!`, 
      updated_invoice
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};
