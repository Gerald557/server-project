import { z } from 'zod';

export const create_invoice_schema = z.object({
  work_order_id: z.number({ error: "Work Order ID is required and must be an integer!" }),
  labor_cost: z.number().min(0, "Labor cost cannot be negative!").optional()
});

export const update_invoice_status_schema = z.object({
  status: z.enum(["draft", "submitted", "approved", "paid", "rejected", "cancelled"], {
    error: "A valid status choice is required!"
  })
});
