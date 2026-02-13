import { Path } from '@/http/path'
import { get } from '@/http/requests'
import {
    GetPagedMessagesSchema,
    getPagedMessagesSchema,
} from '@/types/services/message.schema'
import { GetPagedMessagesResponse } from '@/types/services/message.types'

class MessageService {
    async getPagedMessages(
        data: GetPagedMessagesSchema
    ): Promise<GetPagedMessagesResponse> {
        try {
            getPagedMessagesSchema.parse(data)
            let url =
                process.env.NEXT_PUBLIC_API_URL +
                Path.SERVERS +
                `/${data.serverId}` +
                Path.CHANNELS +
                `/${data.channelId}` +
                Path.MESSAGES +
                `?limit=${data.limit}`

            if (data.nextPageState) {
                url += `&nextPageState=${encodeURIComponent(data.nextPageState)}`
            }

            const response = await get(url, true)
            if (response.ok) {
                return await response.json()
            } else {
                throw new Error(`Failed to fetch messages: ${response.status}`)
            }
        } catch (error) {
            console.error('getPagedMessages error:', error)
            throw error
        }
    }
}

export const messageService = new MessageService()
