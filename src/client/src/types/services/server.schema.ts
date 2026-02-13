import { z } from 'zod'

export const createServerSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    icon: z.string().optional(),
})
export type CreateServerSchema = z.infer<typeof createServerSchema>

export const joinServerSchema = z.object({
    serverId: z.string(),
})
export type JoinServerSchema = z.infer<typeof joinServerSchema>

export const createChannelSchema = z.object({
    serverId: z.string(),
    name: z.string(),
    description: z.string().optional(),
})
export type CreateChannelSchema = z.infer<typeof createChannelSchema>

export const deleteServerSchema = z.object({
    serverId: z.string(),
})
export type DeleteServerSchema = z.infer<typeof deleteServerSchema>

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
