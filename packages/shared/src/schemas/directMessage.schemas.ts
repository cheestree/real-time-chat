import { z } from "zod";

export const DirectMessageCreateSchema = z.object({
  recipientId: z
    .string({ message: "Recipient ID must be a string" })
    .uuid("Invalid recipient ID format"),
  content: z
    .string({ message: "Message content must be a string" })
    .min(1, "Message content cannot be empty")
    .max(500, "Message content must be less than 500 characters"),
});

export type DirectMessageCreateInput = z.infer<typeof DirectMessageCreateSchema>;

export const GetPagedDirectMessagesSchema = z.object({
  recipientId: z.string().uuid(),
  limit: z.number().int().min(1),
  nextPageState: z.string().optional(),
});

export type GetPagedDirectMessagesInput = z.infer<typeof GetPagedDirectMessagesSchema>;
