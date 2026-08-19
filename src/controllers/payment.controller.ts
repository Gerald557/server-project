
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendResponse } from '../utils/response';
import { create_payment_schema, update_payment_status_schema } from '../validators/payment.validator';

const prismaClient = prisma as any;

export const CreatePayment = async (req: Request, res: Response) => {
  try {
    const scan_result = create_payment_schema.safeParse(req.body);

    if (!scan_result.success) {
      const first_error_message = scan_result.error.issues[0].message;
      sendResponse(res, 422, false, first_error_message);
      return;
    }

    const { invoice_id } = scan_result.data;

    const existing_invoice = await prismaClient.invoice.findUnique({
      where: { id: invoice_id }
    });

    if (!existing_invoice) {
      sendResponse(res, 404, false, "The target invoice record does not exist!");
      return;
    }

    const existing_payment = await prismaClient.payment.findUnique({
      where: { invoice_id }
    });

    if (existing_payment) {
      sendResponse(res, 400, false, "A payment record has already been initiated for this invoice!");
      return;
    }

    const new_payment = await prismaClient.payment.create({
      data: {
        invoice_id,
        amount: existing_invoice.total_amount,
        status: "pending"
      }
    });

    sendResponse(
      res, 
      201, 
      true, 
      "Payment session initiated successfully!", 
      new_payment
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};


export const GetPayments = async (req: Request, res: Response) => {
  try {
    const all_payments = await prismaClient.payment.findMany();
    sendResponse(res, 200, true, "Payments retrieved successfully!", all_payments);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const UpdatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const parsed_id = parseInt(req.params.id as string);

    if (isNaN(parsed_id)) {
      sendResponse(res, 422, false, "Invalid payment ID!");
      return;
    }

    const scan_result = update_payment_status_schema.safeParse(req.body);

    if (!scan_result.success) {
      sendResponse(res, 400, false, "Invalid payment status payload!");
      return;
    }

    const { status } = scan_result.data;

    const existing_payment = await prismaClient.payment.findUnique({
      where: { id: parsed_id }
    });

    if (!existing_payment) {
      sendResponse(res, 404, false, "Payment record not found!");
      return;
    }

    if (existing_payment.status === "successful") {
      sendResponse(res, 400, false, "This payment has already been completed successfully and cannot be altered!");
      return;
    }

    const updated_payment = await prismaClient.payment.update({
      where: { id: parsed_id },
      data: {
        status,
        updated_at: new Date()
      }
    });

    if (status === "successful") {
      
      await prismaClient.ledgerEntry.create({
        data: {
          payment_id: parsed_id,
          amount: updated_payment.amount,
          transaction_type: "CREDIT",
          description: `Revenue recognized: Payment cleared successfully for Invoice ID ${existing_payment.invoice_id}`
        }
      });

      await prismaClient.invoice.update({
        where: { id: existing_payment.invoice_id },
        data: { status: "paid" }
      });
    }

    sendResponse(
      res, 
      200, 
      true, 
      `Payment status updated successfully to ${status}!`, 
      updated_payment
    );
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const GetLedgerEntries = async (req: Request, res: Response) => {
  try {
    const ledger_entries = await prismaClient.ledgerEntry.findMany();
    sendResponse(res, 200, true, "Immutable ledger entries retrieved successfully!", ledger_entries);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};
