import z from "zod";

const registerZodSchema = z.object({
  name: z
    .string("Name must be a string")
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .email("Email is required and must be a valid email address"),
  password: z
    .string("Password must be a string")
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be less than 128 characters"),
});

const loginZodSchema = z.object({
  email: z
    .email("Email is required and must be a valid email address"),
  password: z
    .string("Password must be a string")
    .min(1, "Password is required"),
});

const changePasswordZodSchema = z.object({
  currentPassword: z
    .string("Current password must be a string")
    .min(1, "Current password is required"),
  newPassword: z
    .string("New password must be a string")
    .min(6, "New password must be at least 6 characters")
    .max(128, "Password must be less than 128 characters"),
});

const verifyEmailZodSchema = z.object({
  email: z
    .email("Email is required and must be a valid email address"),
  otp: z
    .string("OTP must be a string")
    .min(1, "OTP is required"),
});

const forgetPasswordZodSchema = z.object({
  email: z
    .email("Email is required and must be a valid email address"),
});

const resetPasswordZodSchema = z.object({
  email: z
    .email("Email is required and must be a valid email address"),
  otp: z
    .string("OTP must be a string")
    .min(1, "OTP is required"),
  newPassword: z
    .string("New password must be a string")
    .min(6, "New password must be at least 6 characters")
    .max(128, "Password must be less than 128 characters"),
});

export const AuthValidation = {
  registerZodSchema,
  loginZodSchema,
  changePasswordZodSchema,
  verifyEmailZodSchema,
  forgetPasswordZodSchema,
  resetPasswordZodSchema,
};
