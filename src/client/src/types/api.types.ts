// Base API Response wrapper
export type ApiResponse<T> =
    | { success: true; data: T; error?: undefined; message?: string }
    | {
          success: false
          error: string
          message?: string
      }

// User-related types
export type UserSummary = {
    id: string
    username: string
    icon?: string
}

export type AuthenticatedUser = {
    internalId: number
    publicId: string
    profile: {
        id: string
        username: string
    }
}

export type LoginResult = {
    token: string
    user: AuthenticatedUser
}

// Server-related types
export type ServerSummary = {
    id: string
    name: string
    icon?: string
    memberCount: number
}

export type ServerDetail = {
    id: string
    name: string
    description: string
    icon: string
    ownerIds: number[]
    channels: ChannelDetail[]
    users: UserSummary[]
}

// Channel-related types
export type ChannelSummary = {
    id: string
    serverId: string
    name: string
    description: string
    messageCount?: number
    lastMessageId?: string
    lastMessageTimestamp?: string
}

export type ChannelDetail = ChannelSummary & {
    messages: MessageSummary[]
}

export enum ChannelType {
    SERVER = 'SERVER',
    DM = 'DM',
}

// Message-related types
export type MessageSummary = {
    id: string
    authorId: string
    authorUsername: string
    authorIcon?: string
    content: string
    timestamp: string
}

export type MessageDetail = {
    id: string
    type: ChannelType
    serverId?: string
    channelId: string
    authorId: string
    authorUsername: string
    authorIcon?: string
    content: string
    timestamp: string
}

// Pagination types
export type PaginatedResponse<T> = {
    items: T[]
    nextPageState?: string
    total?: number
    hasMore?: boolean
}
