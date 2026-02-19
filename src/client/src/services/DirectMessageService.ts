import { Path } from '@/http/path'
import { get } from '@/http/requests'
import { ConversationSummary, GetDirectMessagesResponse } from '@rtchat/shared'

class DirectMessageService {
    async getDirectMessages(
        recipientId: string,
        limit: number = 50,
        nextPageState?: string
    ): Promise<GetDirectMessagesResponse> {
        try {
            let url =
                process.env.NEXT_PUBLIC_API_URL +
                Path.DIRECT_MESSAGES +
                `/${recipientId}` +
                Path.MESSAGES +
                `?limit=${limit}`

            if (nextPageState) {
                url += `&nextPageState=${encodeURIComponent(nextPageState)}`
            }

            const response = await get(url, true)
            if (response.ok) {
                return await response.json()
            } else {
                throw new Error(
                    `Failed to fetch direct messages: ${response.status}`
                )
            }
        } catch (error) {
            console.error('getDirectMessages error:', error)
            throw error
        }
    }

    async getUserConversations(): Promise<ConversationSummary[]> {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL + Path.DIRECT_MESSAGES

            const response = await get(url, true)
            if (response.ok) {
                const data = await response.json()
                return data.data || []
            } else {
                throw new Error(
                    `Failed to fetch conversations: ${response.status}`
                )
            }
        } catch (error) {
            console.error('getUserConversations error:', error)
            return []
        }
    }
}

export const directMessageService = new DirectMessageService()
