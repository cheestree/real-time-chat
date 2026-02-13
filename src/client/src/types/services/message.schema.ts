import { z } from 'zod'

export const getPagedMessagesSchema = z.object({
    serverId: z.string(),
    channelId: z.string().nonoptional(),
    limit: z.number().int().min(1),
    nextPageState: z.string().optional(),
})
export type GetPagedMessagesSchema = z.infer<typeof getPagedMessagesSchema>
