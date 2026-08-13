import { z } from "zod";

export const verifyPhoneSchema = z.object({
  body: z.object({
    idToken: z.string({ message: "idToken is required" }),
    role: z.enum(["CUSTOMER", "SHOPKEEPER", "ADMIN"]).optional(),
  }),
});
