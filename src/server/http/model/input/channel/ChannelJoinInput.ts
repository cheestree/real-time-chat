import { z } from 'zod'

export const ChannelJoinSchema = z.object({
    channelId: z.string().uuid('Invalid channel ID format'),
})

export type ChannelJoinInput = z.infer<typeof ChannelJoinSchema>
