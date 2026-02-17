import { Message } from '@/domain/Message'
import { ApiResponse } from '@rtchat/shared'

export type GetPagedMessagesResponseData = {
    messages: Message[]
    nextPageState?: string
    serverId: string
    channelId: string
    hasMore: boolean
}

export type GetPagedMessagesResponse = ApiResponse<GetPagedMessagesResponseData>
