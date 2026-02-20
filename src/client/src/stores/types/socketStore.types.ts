import { Conversation, DirectMessage } from '@/domain/DirectMessage'
import { Message } from '@/domain/Message'
import { UserProfile } from '@/domain/UserProfile'
import { ChannelDetail, ServerDetail } from '@rtchat/shared'

// Server-related state and actions
export interface ServerState {
    servers: ServerDetail[]
    currentServerId: string | null
    currentServer: ServerDetail | undefined

    setServers: (servers: ServerDetail[]) => void
    setCurrentServerId: (id: string | null) => void
    addServer: (server: ServerDetail) => void
    removeServer: (serverId: string) => void
    addUserToServer: (serverId: string, user: UserProfile) => void
    removeUserFromServer: (serverId: string, userId: string) => void

    getUserServers: () => Promise<void>
    createServer: (
        name: string,
        description?: string,
        icon?: string
    ) => Promise<void>
    joinServer: (serverId: string) => Promise<void>
    deleteServer: (serverId: string) => Promise<void>
    leaveServer: (serverId: string) => void
    changeServer: (serverId: string) => void
    getServerUsers: (serverId: string) => Promise<UserProfile[]>
    getUserById: (serverId: string, userId: string) => UserProfile | undefined
    getJoinedServerRooms: () => ReadonlySet<string>
}

// Channel-related state and actions
export interface ChannelState {
    currentChannelId: string | null
    currentChannel: ChannelDetail | undefined
    lastViewedChannelByServer: Record<string, string>

    setCurrentChannelId: (id: string | null) => void
    addChannelToServer: (serverId: string, channel: ChannelDetail) => void
    removeChannel: (serverId: string, channelId: string) => void

    createChannel: (name: string, description: string) => Promise<void>
    deleteChannel: (serverId: string, channelId: string) => Promise<void>
    joinChannel: (channelId: string) => void
    leaveChannel: (channelId: string) => void
    changeChannel: (channelId: string) => Promise<void>
    getPagedChannels: (
        serverId: string,
        limit: number,
        offset: number
    ) => Promise<void>
    getJoinedChannelRooms: () => ReadonlySet<string>
}

// Message-related state and actions
export interface MessageState {
    fetchedMessages: Set<string>

    addFetchedMessage: (key: string) => void
    clearFetchedMessages: () => void
    addMessageToChannel: (channelId: string, message: Message) => void
    messageServer: (content: string) => void
    getPagedMessages: (
        serverId: string,
        channelId: string,
        limit: number,
        nextPageState?: string
    ) => Promise<{
        messages: Message[]
        nextPageState: string | undefined
        hasMore: boolean
    }>
}

// DirectMessage-related state and actions
export interface DirectMessageState {
    conversations: Conversation[]
    currentRecipientId: string | null
    currentConversation: Conversation | undefined

    setConversations: (conversations: Conversation[]) => void
    setCurrentRecipientId: (id: string | null) => void
    addMessageToConversation: (
        otherUserId: string,
        otherUsername: string,
        message: DirectMessage
    ) => void
    getUserConversations: () => Promise<void>
    messageDM: (recipientId: string, content: string) => void
    joinDM: (recipientId: string) => void
    leaveDM: (recipientId: string) => void
    changeConversation: (
        recipientId: string,
        recipientUsername?: string
    ) => Promise<void>
    switchToServerMode: () => void
    getDirectMessages: (
        recipientId: string,
        limit: number,
        nextPageState?: string
    ) => Promise<{
        messages: DirectMessage[]
        nextPageState: string | undefined
        hasMore: boolean
    }>
}

// Combined socket store state
export type SocketState = ServerState &
    ChannelState &
    MessageState &
    DirectMessageState
