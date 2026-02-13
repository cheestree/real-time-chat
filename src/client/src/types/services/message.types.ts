import { Message } from '@/domain/Message'
import { ApiResponse } from '../api.types'

export type GetPagedMessagesResponseData = {
    messages: Message[]
    nextPageState?: string
    serverId: string
    channelId: string
    hasMore: boolean
}

export type GetPagedMessagesResponse = ApiResponse<GetPagedMessagesResponseData>
