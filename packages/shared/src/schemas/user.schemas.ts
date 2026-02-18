import { z } from "zod";

export const UserLoginSchema = z.object({
  username: z
    .string({ message: "Username must be a string" })
    .min(1, "Username cannot be empty")
    .max(16, "Username must be less than 16 characters"),
  password: z
    .string({ message: "Password must be a string" })
    .min(1, "Password cannot be empty")
    .max(16, "Password must be less than 16 characters"),
});

export type UserLoginInput = z.infer<typeof UserLoginSchema>;

export const UserRegisterSchema = z.object({
  username: z
    .string({ message: "Username must be a string" })
    .min(1, "Username cannot be empty")
    .max(16, "Username must be less than 16 characters"),
  email: z
    .string({ message: "Email must be a string" })
    .email("Invalid email address format"),
  password: z
    .string({ message: "Password must be a string" })
    .min(1, "Password cannot be empty")
    .max(16, "Password must be less than 16 characters"),
});

export type UserRegisterInput = z.infer<typeof UserRegisterSchema>;

export const UserServersSchema = z.object({
  userId: z
    .string({ message: "User ID must be a string" })
    .uuid("Invalid user ID format"),
});

export type UserServersInput = z.infer<typeof UserServersSchema>;

