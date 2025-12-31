import { z } from 'zod'

export const MessageCreateSchema = z.object({
    serverId: z.number().min(1).optional(),
    channelId: z.number().min(1),
    content: z.string().nonempty(),
})

export type MessageCreateInput = z.infer<typeof MessageCreateSchema>
