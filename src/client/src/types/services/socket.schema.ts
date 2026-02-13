import z from 'zod'

export const messageServerSchema = z.object({
    serverId: z.string(),
    channelId: z.string(),
    content: z.string(),
})
export type MessageServerSchema = z.infer<typeof messageServerSchema>

export const joinServerSchema = z.object({
    serverId: z.string(),
})
export type JoinServerSchema = z.infer<typeof joinServerSchema>

export const joinChannelSchema = z.object({
    channelId: z.string(),
})
export type JoinChannelSchema = z.infer<typeof joinChannelSchema>

export const leaveServerSchema = z.object({
    serverId: z.string(),
})
export type LeaveServerSchema = z.infer<typeof leaveServerSchema>

export const leaveChannelSchema = z.object({
    channelId: z.string(),
})
export type LeaveChannelSchema = z.infer<typeof leaveChannelSchema>

export const deleteServerSocketSchema = z.object({
    id: z.string(),
})
export type DeleteServerSocketSchema = z.infer<typeof deleteServerSocketSchema>
