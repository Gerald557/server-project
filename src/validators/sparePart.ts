import { z } from 'zod';

export const create_spare_part_schema = z.object({
  name: z.string().min(1, "Part name is required and must be a string!"),
  part_number: z.string().min(1, "Part number/serial is required!"),
  quantity_in_stock: z.number().min(0, "Quantity in stock is required and must be a number!"),
  low_stock_threshold: z.number().min(0, "Low stock threshold cannot be negative!").optional(),
  unit_cost: z.number().positive("Unit cost is required and must be greater than 0!")
});

export const add_part_to_work_order_schema = z.object({
  work_order_id: z.number().int(),
  spare_part_id: z.number().int(),
  quantity_used: z.number().positive("Must use at least 1 spare part!")
});