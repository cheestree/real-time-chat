import { z } from "zod";

export const ServerCreateSchema = z.object({
  name: z
    .string({ message: "Server name must be a string" })
    .min(1, "Server name cannot be empty")
    .max(100, "Server name must be less than 100 characters"),
  description: z
    .string({ message: "Server description must be a string" })
    .max(500, "Server description must be less than 500 characters")
    .optional(),
  icon: z.string({ message: "Server icon must be a string" }).optional(),
});

export type ServerCreateInput = z.infer<typeof ServerCreateSchema>;

export const ServerJoinSchema = z.object({
  serverId: z
    .string({ message: "Server ID must be a string" })
    .uuid("Invalid server ID format"),
});

export type ServerJoinInput = z.infer<typeof ServerJoinSchema>;

export const ServerLeaveSchema = z.object({
  serverId: z
    .string({ message: "Server ID must be a string" })
    .uuid("Invalid server ID format"),
});

export type ServerLeaveInput = z.infer<typeof ServerLeaveSchema>;

export const ServerDeleteSchema = z.object({
  serverId: z
    .string({ message: "Server ID must be a string" })
    .uuid("Invalid server ID format"),
});

export type ServerDeleteInput = z.infer<typeof ServerDeleteSchema>;

export const ServerDetailsSchema = z.object({
  serverId: z
    .number({ message: "Server ID must be a number" })
    .min(1, "Server ID must be greater than 0"),
});

export type ServerDetailsInput = z.infer<typeof ServerDetailsSchema>;

export const ServerExistsSchema = z.object({
  serverId: z
    .string({ message: "Server ID must be a string" })
    .uuid("Invalid server ID format"),
});

export type ServerExistsInput = z.infer<typeof ServerExistsSchema>;

