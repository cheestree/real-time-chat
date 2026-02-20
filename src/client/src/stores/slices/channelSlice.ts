import { serverService } from '@/services/ServerService'
import { socketService } from '@/services/SocketService'
import { StateCreator } from 'zustand'
import { ChannelState, SocketState } from '../types/socketStore.types'
import { ensureChannelArrays } from '../utils/serverStateSync'

export const createChannelSlice: StateCreator<
    SocketState,
    [['zustand/immer', never], ['zustand/devtools', never]],
    [],
    Pick<SocketState, keyof ChannelState>
> = (set, get) => ({
    // State
    currentChannelId: null,
    currentChannel: undefined,
    lastViewedChannelByServer: {},

    // Setters
    setCurrentChannelId: (id) => {
        set((state) => {
            state.currentChannelId = id
            const { currentServerId } = get()
            if (id && currentServerId) {
                const server = state.servers.find(
                    (s) => s.id === currentServerId
                )
                const channel = server?.channels?.find((c) => c.id === id)
                state.currentChannel = channel
            } else {
                state.currentChannel = undefined
            }
        })
    },

    addChannelToServer: (serverId, channel) => {
        set((state) => {
            const server = state.servers.find((s) => s.id === serverId)
            if (server) {
                if (!server.channels) server.channels = []
                ensureChannelArrays(channel)
                const channelExists = server.channels.some(
                    (ch) => ch.id === channel.id
                )
                if (!channelExists) {
                    server.channels.push(channel)
                    if (state.currentChannelId === channel.id) {
                        state.currentChannel = channel
                    }
                    if (state.currentServerId === serverId) {
                        state.currentServer = server
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
                if (state.currentChannelId === channelId) {
                    state.currentChannel = undefined
                    state.currentChannelId = null
                }
                if (state.currentServerId === serverId) {
                    state.currentServer = server
                }
            }
        })
    },

    // Async actions
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

                    // Switch to the newly created channel and update last viewed channel for this server
                    state.currentChannelId = newChannel.id
                    state.currentChannel = newChannel
                    state.lastViewedChannelByServer[currentServerId] =
                        newChannel.id
                }
            })
            socketService.joinChannel({ channelId: newChannel.id })
        }
    },

    deleteChannel: async (serverId, channelId) => {
        await serverService.deleteChannel({ serverId, channelId })
    },

    joinChannel: (channelId) => {
        socketService.joinChannel({ channelId })
    },

    leaveChannel: (channelId) => {
        socketService.leaveChannel({ channelId })
    },

    changeChannel: async (channelId) => {
        const { currentServerId } = get()

        // Update the channel selection and history
        set((state) => {
            if (currentServerId) {
                state.lastViewedChannelByServer[currentServerId] = channelId
            }
            state.currentChannelId = channelId

            if (currentServerId) {
                const server = state.servers.find(
                    (s) => s.id === currentServerId
                )
                const channel = server?.channels.find((c) => c.id === channelId)
                state.currentChannel = channel
            }
        })

        const room = `channel_${channelId}`
        if (!socketService.getJoinedChannelRooms().has(room)) {
            if (currentServerId) {
                await get().getPagedMessages(currentServerId, channelId, 50)
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

    getPagedChannels: async (serverId, limit, offset) => {
        const result = await serverService.getPagedChannels({
            serverId,
            limit,
            offset,
        })
        if (result.success) {
            set((state) => {
                const server = state.servers.find((s) => s.id === serverId)
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

    getJoinedChannelRooms: () => {
        return socketService.getJoinedChannelRooms()
    },
})
