import { Message } from '@/domain/Message'
import { UserProfile } from '@/domain/UserProfile'
import { messageService } from '@/services/MessageService'
import { serverService } from '@/services/ServerService'
import { socketService } from '@/services/SocketService'
import { ChannelDetail, ServerDetail } from '@/types/api.types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface SocketState {
    servers: ServerDetail[]
    currentServerId: string | null
    currentChannelId: string | null
    currentServer: ServerDetail | undefined
    currentChannel: ChannelDetail | undefined
    fetchedMessages: Set<string>
    lastViewedChannelByServer: Record<string, string>

    setServers: (servers: ServerDetail[]) => void
    setCurrentServerId: (id: string | null) => void
    setCurrentChannelId: (id: string | null) => void
    addFetchedMessage: (key: string) => void
    clearFetchedMessages: () => void

    getUserServers: () => Promise<void>
    createServer: (
        name: string,
        description?: string,
        icon?: string
    ) => Promise<void>
    joinServer: (serverId: string) => Promise<void>
    createChannel: (name: string, description: string) => Promise<void>
    deleteChannel: (serverId: string, channelId: string) => Promise<void>
    deleteServer: (serverId: string) => Promise<void>
    messageServer: (content: string) => void
    leaveServer: (serverId: string) => void
    joinChannel: (channelId: string) => void
    leaveChannel: (channelId: string) => void
    changeServer: (serverId: string) => void
    changeChannel: (channelId: string) => Promise<void>
    getPagedChannels: (
        serverId: string,
        limit: number,
        offset: number
    ) => Promise<void>
    getPagedMessages: (
        serverId: string,
        channelId: string,
        limit: number,
        nextPageState?: string
    ) => Promise<{
        messages: Message[]
        nextPageState?: string
        hasMore: boolean
    }>
    getServerUsers: (serverId: string) => Promise<UserProfile[]>
    getUserById: (serverId: string, userId: string) => UserProfile | undefined
    getJoinedChannelRooms: () => ReadonlySet<string>
    getJoinedServerRooms: () => ReadonlySet<string>
}

export const useSocketStore = create<SocketState>()(
    devtools(
        (set, get) => ({
            servers: [],
            currentServerId: null,
            currentChannelId: null,
            currentServer: undefined,
            currentChannel: undefined,
            fetchedMessages: new Set(),
            lastViewedChannelByServer: {},

            setServers: (servers) => {
                set({ servers })
                const { currentServerId, currentChannelId } = get()
                if (currentServerId) {
                    const server = servers.find((s) => s.id === currentServerId)
                    set({ currentServer: server })
                    if (currentChannelId && server) {
                        const channel = server.channels?.find(
                            (c) => c.id === currentChannelId
                        )
                        set({ currentChannel: channel })
                    }
                }
            },

            setCurrentServerId: (id) => {
                set({ currentServerId: id })
                if (id) {
                    const server = get().servers.find((s) => s.id === id)
                    set({ currentServer: server })
                } else {
                    set({ currentServer: undefined })
                }
            },

            setCurrentChannelId: (id) => {
                set({ currentChannelId: id })
                const { currentServerId, servers } = get()
                if (id && currentServerId) {
                    const server = servers.find((s) => s.id === currentServerId)
                    const channel = server?.channels?.find((c) => c.id === id)
                    set({ currentChannel: channel })
                } else {
                    set({ currentChannel: undefined })
                }
            },

            addFetchedMessage: (key) => {
                set((state) => ({
                    fetchedMessages: new Set(state.fetchedMessages).add(key),
                }))
            },

            clearFetchedMessages: () => {
                set({ fetchedMessages: new Set() })
            },

            getUserServers: async () => {
                const result = await serverService.listServers()
                if (result.success) {
                    get().setServers(result.data)
                    const { currentServerId } = get()
                    const firstServer = result.data[0]
                    if (
                        !currentServerId &&
                        firstServer &&
                        firstServer.channels &&
                        firstServer.channels.length > 0
                    ) {
                        get().setCurrentServerId(firstServer.id)
                        get().setCurrentChannelId(firstServer.channels[0]!.id)
                    }
                }
            },

            createServer: async (name, description, icon) => {
                const result = await serverService.createServer({
                    name,
                    description,
                    icon,
                })
                if (result.success) {
                    get().setServers([...get().servers, result.data])
                    get().setCurrentServerId(result.data.id)
                    get().setCurrentChannelId(null)
                }
            },

            joinServer: async (serverId) => {
                const result = await serverService.joinServer({ serverId })
                if (result.success) {
                    get().setServers([...get().servers, result.data])
                    get().setCurrentServerId(result.data.id)
                    get().setCurrentChannelId(null)
                }
            },

            createChannel: async (name, description) => {
                const { currentServerId } = get()
                if (!currentServerId) return

                const result = await serverService.createChannel({
                    serverId: currentServerId,
                    name,
                    description,
                })
                if (result.success) {
                    set((state) => ({
                        servers: state.servers.map((s) => {
                            if (s.id !== currentServerId) return s
                            return {
                                ...s,
                                channels: [
                                    ...(s.channels || []),
                                    { ...result.data, messages: [] },
                                ],
                            }
                        }),
                    }))
                }
            },

            deleteChannel: async (serverId, channelId) => {
                await serverService.deleteChannel({ serverId, channelId })
            },

            deleteServer: async (serverId) => {
                await serverService.deleteServer({ serverId })
            },

            messageServer: (content) => {
                const { currentServerId, currentChannelId } = get()
                if (!currentServerId || !currentChannelId) return
                socketService.messageServer({
                    serverId: currentServerId,
                    channelId: currentChannelId,
                    content,
                })
            },

            leaveServer: (serverId) => {
                socketService.leaveServer({ serverId })
            },

            joinChannel: (channelId) => {
                socketService.joinChannel({ channelId })
            },

            leaveChannel: (channelId) => {
                socketService.leaveChannel({ channelId })
            },

            getPagedChannels: async (serverId, limit, offset) => {
                const result = await serverService.getPagedChannels({
                    serverId,
                    limit,
                    offset,
                })
                if (result.success) {
                    set((state) => ({
                        servers: state.servers.map((server) => {
                            if (server.id === serverId) {
                                const existingChannelIds = new Set(
                                    (server.channels || []).map((c) => c.id)
                                )
                                const newChannels = result.data
                                    .filter(
                                        (c) => !existingChannelIds.has(c.id)
                                    )
                                    .map((c) => ({ ...c, messages: [] }))
                                return {
                                    ...server,
                                    channels: [
                                        ...(server.channels || []),
                                        ...newChannels,
                                    ],
                                }
                            }
                            return server
                        }),
                    }))
                }
            },

            getPagedMessages: async (
                serverId,
                channelId,
                limit,
                nextPageState
            ) => {
                const result = await messageService.getPagedMessages({
                    serverId,
                    channelId,
                    limit,
                    nextPageState,
                })

                if (result.success) {
                    const {
                        messages,
                        nextPageState: newPageState,
                        hasMore,
                    } = result.data

                    set((state) => ({
                        servers: state.servers.map((server) => ({
                            ...server,
                            channels: server.channels.map((channel) => {
                                if (channel.id !== channelId) return channel

                                const existingMessageIds = new Set(
                                    (channel.messages || []).map((m) => m.id)
                                )
                                const newMessages = messages.filter(
                                    (m) => !existingMessageIds.has(m.id)
                                )
                                const mergedMessages = [
                                    ...(channel.messages || []),
                                    ...newMessages,
                                ].sort(
                                    (a, b) =>
                                        new Date(a.timestamp).getTime() -
                                        new Date(b.timestamp).getTime()
                                )

                                return {
                                    ...channel,
                                    messages: mergedMessages,
                                }
                            }),
                        })),
                    }))

                    return {
                        messages,
                        nextPageState: newPageState,
                        hasMore,
                    }
                }
                return { messages: [], hasMore: false }
            },

            getServerUsers: async (serverId) => {
                const result = await serverService.getServerUsers({ serverId })
                if (result.success) {
                    return result.data
                }
                return []
            },

            getUserById: (serverId, userId) => {
                const server = get().servers.find((s) => s.id === serverId)
                return server?.users?.find((u) => u.id === userId)
            },

            changeServer: (serverId) => {
                const server = get().servers.find((s) => s.id === serverId)
                if (server) {
                    get().setCurrentServerId(serverId)
                    const lastViewedChannelId =
                        get().lastViewedChannelByServer[serverId]
                    const lastViewedChannel = server.channels?.find(
                        (c) => c.id === lastViewedChannelId
                    )
                    // Use last viewed channel if it exists, otherwise use first channel
                    const channelToSelect =
                        lastViewedChannel || server.channels?.[0]
                    get().setCurrentChannelId(channelToSelect?.id || null)
                    const room = `server_${serverId}`
                    if (!socketService.getJoinedServerRooms().has(room)) {
                        socketService.joinServer({ serverId })
                    }
                }
            },

            changeChannel: async (channelId) => {
                const { currentServerId } = get()
                if (currentServerId) {
                    set((state) => ({
                        lastViewedChannelByServer: {
                            ...state.lastViewedChannelByServer,
                            [currentServerId]: channelId,
                        },
                    }))
                }
                get().setCurrentChannelId(channelId)
                const room = `channel_${channelId}`
                if (!socketService.getJoinedChannelRooms().has(room)) {
                    if (currentServerId) {
                        await get().getPagedMessages(
                            currentServerId,
                            channelId,
                            50
                        )
                        get().setCurrentChannelId(channelId)
                    }
                    socketService.joinChannel({ channelId })
                }
            },

            getJoinedChannelRooms: () => {
                return socketService.getJoinedChannelRooms()
            },

            getJoinedServerRooms: () => {
                return socketService.getJoinedServerRooms()
            },
        }),
        { name: 'SocketStore' }
    )
)

// Convenience selectors
export const useCurrentServer = () =>
    useSocketStore((state) => state.currentServer)
export const useCurrentChannel = () =>
    useSocketStore((state) => state.currentChannel)
export const useServers = () => useSocketStore((state) => state.servers)
export const useCurrentServerId = () =>
    useSocketStore((state) => state.currentServerId)
export const useCurrentChannelId = () =>
    useSocketStore((state) => state.currentChannelId)
