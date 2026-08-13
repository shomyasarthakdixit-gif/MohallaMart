import { z } from "zod";

export const createShopSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Shop name is required"),
    address: z.string().min(5, "Address is required"),
    description: z.string().optional(),
    openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be in HH:MM format").optional(),
    closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be in HH:MM format").optional(),
  }),
});

export const updateShopSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    address: z.string().min(5).optional(),
    description: z.string().optional(),
    openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    isActive: z.boolean().optional(),
    scheduledDeliveryFee: z.number().nonnegative().optional(),
    expressDeliveryFee: z.number().nonnegative().optional(),
    deliveryRadius: z.number().positive().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});
