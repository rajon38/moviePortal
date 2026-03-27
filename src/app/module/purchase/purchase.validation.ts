import z from "zod";

const createPurchaseZodSchema = z.object({
  type: z
    .enum(["BUY", "RENT", "SUBSCRIPTION"] as const)
    .refine(val => val !== undefined, {
      message: "Type must be BUY, RENT, or SUBSCRIPTION",
    }),
  mediaId: z
    .string()
    .min(1, "Media ID is required"),
});

const updatePurchaseZodSchema = z.object({
  type: z
    .enum(["BUY", "RENT", "SUBSCRIPTION"] as const)
    .refine(val => val !== undefined, {
      message: "Type must be BUY, RENT, or SUBSCRIPTION",
    })
    .optional(),
  price: z
    .number()
    .positive("Price must be greater than 0")
    .optional(),
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .transform(val => val ? new Date(val) : undefined),
});

export const PurchaseValidation = {
  createPurchaseZodSchema,
  updatePurchaseZodSchema,
};
