import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendResponse } from '../utils/response';
import { create_payment_schema, update_payment_status_schema } from '../validators/payment';
import { create_ledger_entry_schema } from '../validators/ledger';

export const CreatePayment = async (req: Request, res: Response) => {
  try {
    const scan_result = create_payment_schema.safeParse(req.body);

    if (!scan_result.success) {
      const first_error_message = scan_result.error.issues[0].message;
      sendResponse(res, 422, false, first_error_message);
      return;
    }

    const { invoice_id } = scan_result.data;

    const existing_invoice = await prisma.invoice.findUnique({
      where: { id: invoice_id }
    });

    if (!existing_invoice) {
      sendResponse(res, 404, false, "The target invoice record does not exist!");
      return;
    }

    const existing_payment = await prisma.payment.findUnique({
      where: { invoice_id }
    });

    if (existing_payment) {
      sendResponse(res, 400, false, "A payment record has already been initiated for this invoice!");
      return;
    }

    const new_payment = await prisma.payment.create({
      data: {
        invoice_id,
        amount: existing_invoice.total_amount,
        status: "pending"
      }
    });

    sendResponse(res, 201, true, "Payment session initiated successfully!", new_payment);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};


export const GetPayments = async (req: Request, res: Response) => {
  try {
    const all_payments = await prisma.payment.findMany();
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

    const existing_payment = await prisma.payment.findUnique({
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

    const updated_payment = await prisma.payment.update({
      where: { id: parsed_id },
      data: {
        status,
        updated_at: new Date()
      }
    });

    if (status === "successful") {
      await prisma.ledgerEntry.create({
        data: {
          payment_id: parsed_id,
          amount: updated_payment.amount,
          transaction_type: "DEBIT",
          description: `Debit: Invoice paid - Payment cleared successfully for Invoice ID ${existing_payment.invoice_id}`
        }
      });

      await prisma.invoice.update({
        where: { id: existing_payment.invoice_id },
        data: { status: "paid" }
      });
    } else if (status === "reversed") {
   
      await prisma.ledgerEntry.create({
        data: {
          payment_id: parsed_id,
          amount: updated_payment.amount,
          transaction_type: "CREDIT",
          description: `Credit: Failed payment reversed for Invoice ID ${existing_payment.invoice_id}`
        }
      });
    }

    sendResponse(res, 200, true, `Payment status updated successfully to ${status}!`, updated_payment);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const CreateLedgerEntry = async (req: Request, res: Response) => {
  try {
    const scan_result = create_ledger_entry_schema.safeParse(req.body);

    if (!scan_result.success) {
      const first_error_message = scan_result.error.issues[0].message;
      sendResponse(res, 422, false, first_error_message);
      return;
    }

    const { amount, transaction_type, description } = scan_result.data;
    
    const raw_payment_id = req.body.payment_id;
    let parsed_payment_id: number;

    if (raw_payment_id === undefined || raw_payment_id === null) {
      sendResponse(res, 422, false, "A valid payment ID must be provided!");
      return;
    }

    parsed_payment_id = Number(raw_payment_id);
    if (!Number.isInteger(parsed_payment_id) || parsed_payment_id <= 0) {
      sendResponse(res, 422, false, "A valid payment ID must be a positive integer!");
      return;
    }

    const ledger_entry_data = {
      amount,
      transaction_type,
      description: `${transaction_type === "CREDIT" ? "Credit" : "Debit"}: ${description}`
    };

    const new_entry = await prisma.ledgerEntry.create({
      data: { ...ledger_entry_data, payment_id: parsed_payment_id }
    });

    sendResponse(res, 201, true, "Ledger transaction recorded in books successfully!", new_entry);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const GetLedgerEntries = async (req: Request, res: Response) => {
  try {
    const ledger_entries = await prisma.ledgerEntry.findMany({
      orderBy: { created_at: 'desc' }
    });
    sendResponse(res, 200, true, "Immutable ledger entries retrieved successfully!", ledger_entries);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const GetWalletBalance = async (req: Request, res: Response) => {
  try {
    const entries = await prisma.ledgerEntry.findMany();

    let total_credits = 0;
    let total_debits = 0;

    for (const entry of entries) {
      if (entry.transaction_type === "CREDIT") {
        total_credits += entry.amount;
      } else if (entry.transaction_type === "DEBIT") {
        total_debits += entry.amount;
      }
    }

    const active_balance = total_credits - total_debits;

    sendResponse(res, 200, true, "Active wallet balance compiled successfully!", {
      total_credits,
      total_debits,
      active_wallet_balance: active_balance
    });
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};
