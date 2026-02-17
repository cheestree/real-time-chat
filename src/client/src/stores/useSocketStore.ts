import { Message } from '@/domain/Message'
import { UserProfile } from '@/domain/UserProfile'
import { messageService } from '@/services/MessageService'
import { serverService } from '@/services/ServerService'
import { socketService } from '@/services/SocketService'
import { ChannelDetail, ServerDetail } from '@rtchat/shared'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

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

    // Socket event handlers
    addServer: (server: ServerDetail) => void
    addChannelToServer: (serverId: string, channel: ChannelDetail) => void
    removeChannel: (serverId: string, channelId: string) => void
    addUserToServer: (serverId: string, user: UserProfile) => void
    removeUserFromServer: (serverId: string, userId: string) => void
    removeServer: (serverId: string) => void
    addMessageToChannel: (channelId: string, message: Message) => void

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
        immer((set, get) => ({
            servers: [],
            currentServerId: null,
            currentChannelId: null,
            currentServer: undefined,
            currentChannel: undefined,
            fetchedMessages: new Set(),
            lastViewedChannelByServer: {},

            setServers: (servers) => {
                set((state) => {
                    state.servers = servers
                    const { currentServerId, currentChannelId } = get()
                    if (currentServerId) {
                        const server = servers.find(
                            (s) => s.id === currentServerId
                        )
                        state.currentServer = server
                        if (currentChannelId && server) {
                            const channel = server.channels?.find(
                                (c) => c.id === currentChannelId
                            )
                            state.currentChannel = channel
                        }
                    }
                })
            },

            setCurrentServerId: (id) => {
                set((state) => {
                    state.currentServerId = id
                    if (id) {
                        const server = state.servers.find((s) => s.id === id)
                        state.currentServer = server
                    } else {
                        state.currentServer = undefined
                    }
                })
            },

            setCurrentChannelId: (id) => {
                set((state) => {
                    state.currentChannelId = id
                    const { currentServerId } = get()
                    if (id && currentServerId) {
                        const server = state.servers.find(
                            (s) => s.id === currentServerId
                        )
                        const channel = server?.channels?.find(
                            (c) => c.id === id
                        )
                        state.currentChannel = channel
                    } else {
                        state.currentChannel = undefined
                    }
                })
            },

            addFetchedMessage: (key) => {
                set((state) => {
                    state.fetchedMessages.add(key)
                })
            },

            clearFetchedMessages: () => {
                set((state) => {
                    state.fetchedMessages = new Set()
                })
            },

            // Socket event handlers
            addServer: (server) => {
                set((state) => {
                    if (!server.channels) server.channels = []
                    if (!server.users) server.users = []
                    state.servers.push(server)
                })
            },

            addChannelToServer: (serverId, channel) => {
                set((state) => {
                    const server = state.servers.find((s) => s.id === serverId)
                    if (server) {
                        if (!server.channels) server.channels = []
                        if (!channel.messages) channel.messages = []
                        const channelExists = server.channels.some(
                            (ch) => ch.id === channel.id
                        )
                        if (!channelExists) {
                            server.channels.push(channel)
                            // Update currentChannel if this is the active channel
                            if (state.currentChannelId === channel.id) {
                                state.currentChannel = channel
                            }
                        }
                    }
                })
            },

            removeChannel: (serverId, channelId) => {
                set((state) => {
                    const server = state.servers.find((s) => s.id === serverId)
                    if (server) {
                        server.channels = server.channels.filter(
                            (ch) => ch.id !== channelId
                        )
                        // Clear currentChannel if we removed the active channel
                        if (state.currentChannelId === channelId) {
                            state.currentChannel = undefined
                            state.currentChannelId = null
                        }
                    }
                })
            },

            addUserToServer: (serverId, user) => {
                set((state) => {
                    const server = state.servers.find((s) => s.id === serverId)
                    if (server) {
                        const userExists = server.users.some(
                            (u) => u.id === user.id
                        )
                        if (!userExists) {
                            server.users.push(user)
                        }
                    }
                })
            },

            removeUserFromServer: (serverId, userId) => {
                set((state) => {
                    const server = state.servers.find((s) => s.id === serverId)
                    if (server) {
                        server.users = server.users.filter(
                            (u) => u.id !== userId
                        )
                    }
                })
            },

            removeServer: (serverId) => {
                set((state) => {
                    state.servers = state.servers.filter(
                        (s) => s.id !== serverId
                    )
                })
            },

            addMessageToChannel: (channelId, message) => {
                set((state) => {
                    for (const server of state.servers) {
                        const channel = server.channels.find(
                            (c) => c.id === channelId
                        )
                        if (channel) {
                            if (!channel.messages) channel.messages = []
                            const messageExists = channel.messages.some(
                                (m) => m.id === message.id
                            )
                            if (!messageExists) {
                                channel.messages.push(message)
                            }
                            // Update currentChannel if this is the active channel
                            if (state.currentChannelId === channelId) {
                                state.currentChannel = channel
                            }
                            break
                        }
                    }
                })
            },

            getUserServers: async () => {
                const result = await serverService.listServers()
                if (result.success) {
                    set((state) => {
                        state.servers = result.data
                        const firstServer = result.data[0]
                        if (
                            !state.currentServerId &&
                            firstServer &&
                            firstServer.channels &&
                            firstServer.channels.length > 0
                        ) {
                            state.currentServerId = firstServer.id
                            state.currentServer = firstServer
                            state.currentChannelId = firstServer.channels[0]!.id
                            state.currentChannel = firstServer.channels[0]
                        }
                    })

                    // Fetch messages for the first channel
                    set(async (state) => {
                        const firstServer = result.data[0]
                        const firstChannel = firstServer?.channels?.[0]
                        if (firstServer && firstChannel) {
                            await state.getPagedMessages(
                                firstServer.id,
                                firstChannel.id,
                                50
                            )
                            socketService.joinChannel({
                                channelId: firstChannel.id,
                            })
                        }
                    })
                }
            },

            createServer: async (name, description, icon) => {
                const result = await serverService.createServer({
                    name,
                    description,
                    icon,
                })
                if (result.success) {
                    const server = result.data
                    const generalChannel = server.channels?.[0]

                    set((state) => {
                        state.servers.push(server)
                        state.currentServerId = server.id
                        state.currentServer = server

                        // If there's a general channel, switch to it
                        if (generalChannel) {
                            state.currentChannelId = generalChannel.id
                            state.currentChannel = generalChannel
                            state.lastViewedChannelByServer[server.id] =
                                generalChannel.id
                        } else {
                            state.currentChannelId = null
                            state.currentChannel = undefined
                        }
                    })

                    // Join the general channel socket room
                    if (generalChannel) {
                        socketService.joinChannel({
                            channelId: generalChannel.id,
                        })
                    }
                }
            },

            joinServer: async (serverId) => {
                const result = await serverService.joinServer({ serverId })
                if (result.success) {
                    const server = result.data
                    const firstChannel = server.channels?.[0]

                    // Ensure channels and users arrays exist
                    if (!server.channels) server.channels = []
                    if (!server.users) server.users = []

                    set((state) => {
                        // Check if server already exists
                        const existingIndex = state.servers.findIndex(
                            (s) => s.id === server.id
                        )
                        if (existingIndex >= 0) {
                            // Update existing server
                            state.servers[existingIndex] = server
                        } else {
                            // Add new server
                            state.servers.push(server)
                        }
                        state.currentServerId = server.id
                        state.currentServer = server

                        // If there's a first channel, switch to it
                        if (firstChannel) {
                            state.currentChannelId = firstChannel.id
                            state.currentChannel = firstChannel
                            state.lastViewedChannelByServer[server.id] =
                                firstChannel.id
                        } else {
                            state.currentChannelId = null
                            state.currentChannel = undefined
                        }
                    })

                    // Join the first channel socket room
                    if (firstChannel) {
                        socketService.joinChannel({
                            channelId: firstChannel.id,
                        })
                    }
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
                    const newChannel = {
                        ...result.data,
                        messages: [],
                    }

                    set((state) => {
                        const server = state.servers.find(
                            (s) => s.id === currentServerId
                        )
                        if (server) {
                            if (!server.channels) server.channels = []
                            server.channels.push(newChannel)

                            // Switch to the newly created channel
                            state.currentChannelId = newChannel.id
                            state.currentChannel = newChannel

                            // Update last viewed channel for this server
                            state.lastViewedChannelByServer[currentServerId] =
                                newChannel.id
                        }
                    })

                    // Join the channel socket room
                    socketService.joinChannel({ channelId: newChannel.id })
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
                    set((state) => {
                        const server = state.servers.find(
                            (s) => s.id === serverId
                        )
                        if (server) {
                            if (!server.channels) server.channels = []
                            const existingChannelIds = new Set(
                                server.channels.map((c) => c.id)
                            )
                            const newChannels = result.data
                                .filter((c) => !existingChannelIds.has(c.id))
                                .map((c) => ({ ...c, messages: [] }))
                            server.channels.push(...newChannels)
                        }
                    })
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

                    set((state) => {
                        const server = state.servers.find(
                            (s) => s.id === serverId
                        )
                        const channel = server?.channels.find(
                            (c) => c.id === channelId
                        )
                        if (channel) {
                            if (!channel.messages) channel.messages = []
                            const existingMessageIds = new Set(
                                channel.messages.map((m) => m.id)
                            )
                            const newMessages = messages.filter(
                                (m) => !existingMessageIds.has(m.id)
                            )
                            channel.messages.push(...newMessages)
                            channel.messages.sort(
                                (a, b) =>
                                    new Date(a.timestamp).getTime() -
                                    new Date(b.timestamp).getTime()
                            )
                            // Update currentChannel if this is the active channel
                            if (state.currentChannelId === channelId) {
                                state.currentChannel = channel
                            }
                        }
                    })

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

            changeServer: async (serverId) => {
                let selectedChannelId: string | null = null

                set((state) => {
                    const server = state.servers.find((s) => s.id === serverId)
                    if (server) {
                        state.currentServerId = serverId
                        state.currentServer = server

                        // Check if there's a last viewed channel for this server
                        const lastViewedChannelId =
                            state.lastViewedChannelByServer[serverId]
                        const lastViewedChannel = server.channels?.find(
                            (c) => c.id === lastViewedChannelId
                        )
                        // Use last viewed channel if it exists, otherwise use first channel
                        const channelToSelect =
                            lastViewedChannel || server.channels?.[0]

                        selectedChannelId = channelToSelect?.id || null
                        state.currentChannelId = selectedChannelId
                        state.currentChannel = channelToSelect
                    }
                })

                const room = `server_${serverId}`
                if (!socketService.getJoinedServerRooms().has(room)) {
                    socketService.joinServer({ serverId })
                }

                // Fetch messages for the selected channel if not already joined
                if (selectedChannelId) {
                    const channelRoom = `channel_${selectedChannelId}`
                    if (
                        !socketService.getJoinedChannelRooms().has(channelRoom)
                    ) {
                        await get().getPagedMessages(
                            serverId,
                            selectedChannelId,
                            50
                        )
                        // Sync channel reference after fetching messages
                        set((state) => {
                            const server = state.servers.find(
                                (s) => s.id === serverId
                            )
                            const channel = server?.channels.find(
                                (c) => c.id === selectedChannelId
                            )
                            state.currentChannel = channel
                        })
                        socketService.joinChannel({
                            channelId: selectedChannelId,
                        })
                    }
                }
            },

            changeChannel: async (channelId) => {
                const { currentServerId } = get()

                // Update the channel selection and history
                set((state) => {
                    if (currentServerId) {
                        state.lastViewedChannelByServer[currentServerId] =
                            channelId
                    }
                    state.currentChannelId = channelId

                    if (currentServerId) {
                        const server = state.servers.find(
                            (s) => s.id === currentServerId
                        )
                        const channel = server?.channels.find(
                            (c) => c.id === channelId
                        )
                        state.currentChannel = channel
                    }
                })

                const room = `channel_${channelId}`
                if (!socketService.getJoinedChannelRooms().has(room)) {
                    if (currentServerId) {
                        await get().getPagedMessages(
                            currentServerId,
                            channelId,
                            50
                        )
                        // After fetching messages, sync the channel reference again
                        set((state) => {
                            if (currentServerId) {
                                const server = state.servers.find(
                                    (s) => s.id === currentServerId
                                )
                                const channel = server?.channels.find(
                                    (c) => c.id === channelId
                                )
                                state.currentChannel = channel
                            }
                        })
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
        })),
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
