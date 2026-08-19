import { z } from 'zod';

export const create_machine_schema = z.object({
  name: z.string().min(1, "Machine name is required and must be a string!"),
  type: z.string().min(1, "Machine type is required and must be a string!"),
  serial_number: z.string().min(1, "Serial number is required!"),
  location: z.string().min(1, "Location is required!")
});