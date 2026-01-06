import { z } from 'zod'

export const ChannelCreateSchema = z.object({
    serverId: z
        .string('Server ID must be a string')
        .uuid('Invalid server ID format'),
    name: z
        .string('Channel name must be a string')
        .min(1, 'Channel name cannot be empty')
        .max(100, 'Channel name must be less than 100 characters'),
    description: z
        .string('Channel description must be a string')
        .max(500, 'Channel description must be less than 500 characters')
        .optional(),
})

export type ChannelCreateInput = z.infer<typeof ChannelCreateSchema>
