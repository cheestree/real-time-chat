export type DirectMessage = {
    id: string
    senderId: string
    recipientId: string
    content: string
    timestamp: string
    authorUsername: string
    authorIcon?: string
}

export type Conversation = {
    id: string
    otherUserId: string
    otherUsername: string
    otherUserIcon?: string
    lastMessage?: DirectMessage
    lastMessageTimestamp?: string
    unreadCount?: number
    messages: DirectMessage[]
}
