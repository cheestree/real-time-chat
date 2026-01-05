import { z } from 'zod'

export const ChannelLeaveSchema = z.object({
    channelId: z
        .string('Channel ID must be a string')
        .uuid('Invalid channel ID format'),
})

export type ChannelLeaveInput = z.infer<typeof ChannelLeaveSchema>
