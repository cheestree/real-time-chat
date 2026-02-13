import { MessageSummary } from './MessageSummary'

export interface GetPagedMessagesResponse {
    messages: MessageSummary[]
    nextPageState?: string
    serverId: string
    channelId: string
    hasMore: boolean
}
