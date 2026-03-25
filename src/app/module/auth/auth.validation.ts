import z from "zod";

const createAuthZodSchema = z.object({
  name: z
    .string("Name must be a string")
    .min(1, "Name cannot be empty")
    .max(100, "Name must be less than 100 characters"),
  // TODO: add more fields
});

const updateAuthZodSchema = z.object({
  name: z
    .string("Name must be a string")
    .min(1, "Name cannot be empty")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  // TODO: add more fields
});

export const AuthValidation = {
  createAuthZodSchema,
  updateAuthZodSchema,
};
