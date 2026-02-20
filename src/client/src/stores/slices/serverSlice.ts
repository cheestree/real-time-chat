import { serverService } from '@/services/ServerService'
import { socketService } from '@/services/SocketService'
import { StateCreator } from 'zustand'
import { ServerState, SocketState } from '../types/socketStore.types'
import {
    ensureServerArrays,
    findLastViewedOrFirstChannel,
} from '../utils/serverStateSync'

export const createServerSlice: StateCreator<
    SocketState,
    [['zustand/immer', never], ['zustand/devtools', never]],
    [],
    Pick<SocketState, keyof ServerState>
> = (set, get) => ({
    // State
    servers: [],
    currentServerId: null,
    currentServer: undefined,

    // Setters
    setServers: (servers) => {
        set((state) => {
            state.servers = servers
            const { currentServerId, currentChannelId } = get()
            if (currentServerId) {
                const server = servers.find((s) => s.id === currentServerId)
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

    addServer: (server) => {
        set((state) => {
            ensureServerArrays(server)
            state.servers.push(server)
        })
    },

    removeServer: (serverId) => {
        set((state) => {
            state.servers = state.servers.filter((s) => s.id !== serverId)
            if (state.currentServerId === serverId) {
                state.currentServer = undefined
                state.currentServerId = null
                state.currentChannel = undefined
                state.currentChannelId = null
            }
        })
    },

    addUserToServer: (serverId, user) => {
        set((state) => {
            const server = state.servers.find((s) => s.id === serverId)
            if (server) {
                const userExists = server.users.some((u) => u.id === user.id)
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
                server.users = server.users.filter((u) => u.id !== userId)
            }
        })
    },

    // Async actions
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

            // Join socket server rooms for all servers
            for (const server of result.data) {
                socketService.joinServer({ serverId: server.id })
            }

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
            ensureServerArrays(server)

            set((state) => {
                // Check if server already exists and update it, otherwise add it
                const existingIndex = state.servers.findIndex(
                    (s) => s.id === server.id
                )
                if (existingIndex >= 0) {
                    state.servers[existingIndex] = server
                } else {
                    state.servers.push(server)
                }
                state.currentServerId = server.id
                state.currentServer = server

                // If there's a first channel, switch to it
                if (firstChannel) {
                    state.currentChannelId = firstChannel.id
                    state.currentChannel = firstChannel
                    state.lastViewedChannelByServer[server.id] = firstChannel.id
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

    deleteServer: async (serverId) => {
        await serverService.deleteServer({ serverId })
    },

    leaveServer: (serverId) => {
        socketService.leaveServer({ serverId })

        set((state) => {
            // Remove the server from the list
            state.servers = state.servers.filter((s) => s.id !== serverId)

            // If we left the currently active server, switch to another one
            if (state.currentServerId === serverId) {
                state.currentServerId = null
                state.currentServer = undefined
                state.currentChannelId = null
                state.currentChannel = undefined

                // Switch to the first available server
                const firstServer = state.servers[0]
                if (firstServer) {
                    state.currentServerId = firstServer.id
                    state.currentServer = firstServer

                    // Get last viewed channel for this server or use first channel
                    const channel = findLastViewedOrFirstChannel(
                        firstServer,
                        state.lastViewedChannelByServer
                    )

                    if (channel) {
                        state.currentChannelId = channel.id
                        state.currentChannel = channel
                    }
                }
            }

            // Clean up last viewed channel for this server
            delete state.lastViewedChannelByServer[serverId]
        })
    },

    changeServer: async (serverId) => {
        let selectedChannelId: string | null = null

        set((state) => {
            const server = state.servers.find((s) => s.id === serverId)
            if (server) {
                state.currentServerId = serverId
                state.currentServer = server

                // Use last viewed channel if it exists, otherwise use first channel
                const channelToSelect = findLastViewedOrFirstChannel(
                    server,
                    state.lastViewedChannelByServer
                )

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
            if (!socketService.getJoinedChannelRooms().has(channelRoom)) {
                await get().getPagedMessages(serverId, selectedChannelId, 50)
                // Sync channel reference after fetching messages
                set((state) => {
                    const server = state.servers.find((s) => s.id === serverId)
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

    getJoinedServerRooms: () => {
        return socketService.getJoinedServerRooms()
    },
})
