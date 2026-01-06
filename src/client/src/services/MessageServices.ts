import { Message } from '@/domain/Message'
import { Path } from '@/http/path'
import { get } from '@/http/requests'

class MessageServices {
    async getPagedMessages(
        serverId: string,
        channelId: string,
        limit: number,
        nextPageState?: string
    ): Promise<{
        messages: Message[]
        nextPageState?: string
        serverId: string
        channelId: string
    }> {
        let url =
            process.env.NEXT_PUBLIC_API_URL +
            Path.SERVERS +
            `/${serverId}` +
            Path.CHANNELS +
            `/${channelId}` +
            Path.MESSAGES +
            `?limit=${limit}`

        if (nextPageState) {
            url += `&nextPageState=${encodeURIComponent(nextPageState)}`
        }

        return await get(url, true).then(async (response) => {
            if (response.ok) {
                return await response.json()
            } else {
                return { messages: [], serverId, channelId }
            }
        })
    }
}

export const messageServices = new MessageServices()
