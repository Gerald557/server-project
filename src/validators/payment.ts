import { z } from 'zod';

export const create_payment_schema = z.object({
  invoice_id: z.number()
});

export const update_payment_status_schema = z.object({
  status: z.enum(["pending", "processing", "successful", "failed", "reversed"]).describe("A valid status choice is required!")
});
