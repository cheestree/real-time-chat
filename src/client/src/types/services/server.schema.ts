import { z } from 'zod'

// Client-only schemas (not used on server)
export const deleteChannelSchema = z.object({
    serverId: z.string(),
    channelId: z.string(),
})
export type DeleteChannelSchema = z.infer<typeof deleteChannelSchema>

export const getPagedChannelsSchema = z.object({
    serverId: z.string(),
    limit: z.number().int().min(1),
    offset: z.number().int().min(0),
})
export type GetPagedChannelsSchema = z.infer<typeof getPagedChannelsSchema>

export const getServerUsersSchema = z.object({
    serverId: z.string(),
})
export type GetServerUsersSchema = z.infer<typeof getServerUsersSchema>
