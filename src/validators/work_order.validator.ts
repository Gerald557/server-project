import { z } from 'zod';

export const create_work_order_schema = z.object({
  machine_id: z.number({ message: "Machine ID is required and must be a number!" }),
  fault_id: z.number().optional(),
  description: z.string().min(1, "Work order description is required!"),
  assigned_to_id: z.number().optional()
});
