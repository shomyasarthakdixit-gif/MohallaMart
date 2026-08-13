import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    price: z.preprocess((val) => Number(val), z.number().positive("Price must be positive")),
    stock: z.preprocess((val) => Number(val), z.number().int().nonnegative("Stock cannot be negative")).optional(),
    categoryName: z.string().min(1, "Category is required"),
    image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    isActive: z.boolean().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID format"),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    price: z.preprocess((val) => Number(val), z.number().positive()).optional(),
    stock: z.preprocess((val) => Number(val), z.number().int().nonnegative()).optional(),
    categoryName: z.string().min(1).optional(),
    image: z.string().url().optional().or(z.literal("")),
    isActive: z.boolean().optional(),
  }),
});
