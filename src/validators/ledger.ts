import { z } from 'zod';

export const create_ledger_entry_schema = z.object({
  payment_id: z.number().optional(),
  amount: z.number({ error: "Amount is required and must be a number!" }).positive("Amount must be greater than 0!"),
  transaction_type: z.enum(["CREDIT", "DEBIT"], {
    error: "Transaction type must be strictly CREDIT or DEBIT!"
  }),
  description: z.string().min(1, "Description/memo is required!")
});
