import { z } from 'zod';

// zod schemas
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
});

export type Product = z.infer<typeof productSchema>;

// interfejs dla serwisow
export interface NewProductData {
  name: string;
  price: number;
  category?: string;
  imageUrl?: string;
}
