import { z } from 'zod'

export const MessageCreateSchema = z.object({
    serverId: z
        .string('Server ID must be a string')
        .uuid('Invalid server ID format')
        .optional(),
    channelId: z
        .string('Channel ID must be a string')
        .uuid('Invalid channel ID format'),
    content: z
        .string('Message content must be a string')
        .min(1, 'Message content cannot be empty')
        .max(500, 'Message content must be less than 500 characters'),
})

export type MessageCreateInput = z.infer<typeof MessageCreateSchema>
