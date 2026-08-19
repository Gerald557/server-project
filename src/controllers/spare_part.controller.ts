
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendResponse } from '../utils/response';
import { create_spare_part_schema, add_part_to_work_order_schema } from '../validators/spare_part.validator';
import nodemailer from 'nodemailer';

const prismaClient = prisma as any;

const sendLowStockAlert = async (part_name: string, current_stock: number) => {
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
      from: '"Warehouse Systems" ',
      to: "supervisor@example.com", 
      subject: `🚨 LOW STOCK ALERT: ${part_name}`,
      html: `
        Warehouse Inventory Warning
        The inventory level for spare part ${part_name} has dropped below its safe threshold!
        Current stock count: ${current_stock} units
        Please log into your procurement system to re-order this item immediately to avoid repair delays.
      `
    });
  } catch (error) {
    console.error("Failed to send low stock alert email:", error);
  }
};

export const CreateSparePart = async (req: Request, res: Response) => {
  try {
    const scan_result = create_spare_part_schema.safeParse(req.body);

    if (!scan_result.success) {
      const first_error_message = scan_result.error.issues[0].message;
      sendResponse(res, 422, false, first_error_message);
      return;
    }

    const { name, part_number, quantity_in_stock, low_stock_threshold, unit_cost } = scan_result.data;

    // Variable in snake_case: new_part
    const new_part = await prismaClient.sparePart.create({
      data: {
        name,
        part_number,
        quantity_in_stock,
        low_stock_threshold: low_stock_threshold !== undefined ? low_stock_threshold : 5,
        unit_cost
      }
    });

    sendResponse(
      res, 
      201, 
      true, 
      "Spare part registered in inventory successfully!", 
      new_part
    );
  } catch (error: any) {
    
    if (error.code === 'P2002') {
      sendResponse(res, 400, false, "A spare part with this part number already exists!");
      return;
    }
    sendResponse(res, 500, false, error.message);
  }
};

// 2. Controller in PascalCase to get all warehouse spare parts
export const GetSpareParts = async (req: Request, res: Response) => {
  try {
    // Variable in snake_case: warehouse_inventory
    const warehouse_inventory = await prismaClient.sparePart.findMany();
    sendResponse(res, 200, true, "Warehouse inventory retrieved successfully!", warehouse_inventory);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

// 3. Controller in PascalCase to checkout parts for a work order
export const AddPartToWorkOrder = async (req: Request, res: Response) => {
  try {
    const scan_result = add_part_to_work_order_schema.safeParse(req.body);

    if (!scan_result.success) {
      const first_error_message = scan_result.error.issues[0].message;
      sendResponse(res, 422, false, first_error_message);
      return;
    }

    const { work_order_id, spare_part_id, quantity_used } = scan_result.data;

    // A. Check if the work order actually exists
    const existing_work_order = await prismaClient.workOrder.findUnique({
      where: { id: work_order_id }
    });

    if (!existing_work_order) {
      sendResponse(res, 404, false, "The target work order does not exist!");
      return;
    }

    // B. Check if the spare part exists in our warehouse
    const target_part = await prismaClient.sparePart.findUnique({
      where: { id: spare_part_id }
    });

    if (!target_part) {
      sendResponse(res, 404, false, "The requested spare part does not exist in inventory!");
      return;
    }

    if (target_part.quantity_in_stock < quantity_used) {
      sendResponse(
        res, 
        422, 
        false, 
        `Insufficient stock! You requested ${quantity_used} units of ${target_part.name}, but we only have ${target_part.quantity_in_stock} units left in stock.`
      );
      return;
    }

    const new_stock_total = target_part.quantity_in_stock - quantity_used;

    await prismaClient.sparePart.update({
      where: { id: spare_part_id },
      data: { quantity_in_stock: new_stock_total }
    });

    const checkout_ticket = {
      work_order_id,
      spare_part_id,
      quantity_used,
      created_at: new Date()
    };

    if (new_stock_total <= target_part.low_stock_threshold) {
      await sendLowStockAlert(target_part.name, new_stock_total);
    }

    sendResponse(
      res, 
      201, 
      true, 
      "Spare parts checked out successfully and deducted from live warehouse stock!", 
      checkout_ticket
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};
