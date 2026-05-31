import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  phone_number: z.string().min(9, "Phone number required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  password_hash: z.string().min(6, "Password must be at least 6 characters").optional(),
  full_name: z.string().min(5, "Full name required"),
  role: z.enum(["admin", "tenant", "agent", "owner"]),
}).refine(data => data.password || data.password_hash, {
  message: "Password is required",
  path: ["password"],
});

export const loginSchema = z.object({
  email: z.string().min(1, "Email required"),
  password: z.string().min(6, "Password required"),
}).or(
  z.object({
    email: z.string().min(1, "Email required"),
    password_hash: z.string().min(6, "Password required"),
  })
);
export const logoutSchema = z.object({
  token: z.string().min(1, "Refresh token required").optional(),
});

export const refreshTokenSchema = z.object({
  token: z.string().min(1, "Refresh token required"),
});
export const updateUserSchema = z.object({
  full_name: z.string().min(1, "Full name required").optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
});

export const requestOTPSchema = z.object({
  email: z.string().email("Invalid email"),
  purpose: z.enum(["email_verification", "password_reset", "two_factor"]).default("email_verification"),
});

export const verifyOTPSchema = z.object({
  email: z.string().email("Invalid email"),
  code: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
  purpose: z.enum(["email_verification", "password_reset", "two_factor"]).default("email_verification"),
});
