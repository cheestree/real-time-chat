import { z } from 'zod'

export const ChannelCreateSchema = z.object({
    serverId: z.number().min(1),
    name: z.string().nonempty().nonoptional(),
    description: z.string().nonempty().optional(),
})

export type ChannelCreateInput = z.infer<typeof ChannelCreateSchema>
