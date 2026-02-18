import { z } from "zod";

export const ChannelCreateSchema = z.object({
  serverId: z
    .string({ message: "Server ID must be a string" })
    .uuid("Invalid server ID format"),
  name: z
    .string({ message: "Channel name must be a string" })
    .min(1, "Channel name cannot be empty")
    .max(100, "Channel name must be less than 100 characters"),
  description: z
    .string({ message: "Channel description must be a string" })
    .max(500, "Channel description must be less than 500 characters")
    .optional(),
});

export type ChannelCreateInput = z.infer<typeof ChannelCreateSchema>;

export const ChannelJoinSchema = z.object({
  channelId: z.string().uuid("Invalid channel ID format"),
});

export type ChannelJoinInput = z.infer<typeof ChannelJoinSchema>;

export const ChannelLeaveSchema = z.object({
  channelId: z
    .string({ message: "Channel ID must be a string" })
    .uuid("Invalid channel ID format"),
});

export type ChannelLeaveInput = z.infer<typeof ChannelLeaveSchema>;

