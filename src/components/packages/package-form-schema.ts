import * as z from "zod";

export const packageFormSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  shipping_cost: z.coerce.number().min(0),
  customs_fees: z.coerce.number().min(0),
  customs_percentage: z.coerce.number().min(0),
  other_costs: z.coerce.number().min(0),
  selling_price: z.coerce.number().min(0),
  international_shipping: z.coerce.number().min(0),
  notes: z.string().optional(),
});

export type PackageFormValues = z.infer<typeof packageFormSchema>;