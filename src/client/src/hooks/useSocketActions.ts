import { Channel } from '@/domain/Channel'
import { Server } from '@/domain/Server'
import { UserProfile } from '@/domain/UserProfile'
import { messageServices } from '@/services/MessageServices'
import { serverServices } from '@/services/ServerServices'
import { socketService } from '@/services/SocketService'
import React, { useCallback } from 'react'

interface UseSocketActionsProps {
    servers: Server[]
    currentServerId: string | null
    currentChannelId: string | null
    setServers: React.Dispatch<React.SetStateAction<Server[]>>
    setCurrentServerId: (id: string | null) => void
    setCurrentChannelId: (id: string | null) => void
}

export function useSocketActions({
    servers,
    currentServerId,
    currentChannelId,
    setServers,
    setCurrentServerId,
    setCurrentChannelId,
}: UseSocketActionsProps) {
    const getJoinedChannelRooms = useCallback(async (): Promise<
        ReadonlySet<string>
    > => {
        return socketService.getJoinedChannelRooms()
    }, [])

    const getJoinedServerRooms = useCallback(async (): Promise<
        ReadonlySet<string>
    > => {
        return socketService.getJoinedServerRooms()
    }, [])

    const getUserById = useCallback(
        (serverId: string, userId: string): UserProfile | undefined => {
            const server = servers.find((s) => s.id === serverId)
            return server?.users?.find((u) => u.id === userId)
        },
        [servers]
    )

    const getUserServers = useCallback(async () => {
        const userServers = await serverServices.listServers()
        const initializedServers = userServers.map((s) => {
            return {
                ...s,
                ownerIds: s.ownerIds || [],
                channelIds: s.channelIds || [],
                userIds: s.userIds || [],
                channels:
                    Array.isArray(s.channels) &&
                    typeof s.channels[0] === 'object'
                        ? s.channels
                        : [],
                users:
                    Array.isArray(s.users) && typeof s.users[0] === 'object'
                        ? s.users
                        : [],
            }
        })
        setServers(initializedServers)
        if (
            initializedServers[0] &&
            initializedServers.length > 0 &&
            !currentServerId
        ) {
            setCurrentServerId(initializedServers[0].id)
            if (
                initializedServers[0].channels &&
                initializedServers[0].channels.length > 0 &&
                initializedServers[0].channels[0]
            ) {
                setCurrentChannelId(initializedServers[0].channels[0].id)
            }
        }
    }, [currentServerId, setServers, setCurrentServerId, setCurrentChannelId])

    const createServer = useCallback(
        async (
            serverName: string,
            serverDescription?: string,
            serverIcon?: string
        ) => {
            const server = await serverServices.createServer(
                serverName,
                serverDescription,
                serverIcon
            )
            const initializedServer = {
                ...server,
                channels: [],
                users: [],
                channelIds: server.channelIds || [],
                userIds: server.userIds || [],
                ownerIds: server.ownerIds || [],
            }
            setServers((prev) => [...prev, initializedServer])
            setCurrentServerId(server.id)
            setCurrentChannelId(null)
        },
        [setServers, setCurrentServerId, setCurrentChannelId]
    )

    const joinServer = useCallback(
        async (serverId: string) => {
            const server = await serverServices.joinServer(serverId)
            const rooms = await getJoinedServerRooms()
            if (rooms.has(serverId)) {
                return
            }
            const initializedServer = {
                ...server,
                channels: [] as Channel[],
                users: [] as UserProfile[],
                channelIds: server.channelIds || [],
                userIds: server.userIds || [],
                ownerIds: server.ownerIds || [],
            }
            setServers((prev) => [...prev, initializedServer])
            setCurrentServerId(server.id)
            setCurrentChannelId(null)
        },
        [
            setServers,
            setCurrentServerId,
            setCurrentChannelId,
            getJoinedServerRooms,
        ]
    )

    const createChannel = useCallback(
        async (channelName: string, channelDescription: string) => {
            if (!currentServerId) return

            const channel = await serverServices.createChannel(
                currentServerId,
                channelName,
                channelDescription
            )
            setServers((prev) => {
                return prev.map((s) => {
                    if (s.id !== currentServerId) return s
                    return {
                        ...s,
                        channels: [...(s.channels || []), channel],
                    }
                })
            })
        },
        [currentServerId, setServers]
    )

    const messageServer = useCallback(
        (message: string) => {
            if (!currentServerId || !currentChannelId) return
            socketService.messageServer(
                currentServerId,
                currentChannelId,
                message
            )
        },
        [currentServerId, currentChannelId]
    )

    const leaveServer = useCallback((serverId: string) => {
        socketService.leaveServer(serverId)
    }, [])

    const deleteServer = useCallback(async (serverId: string) => {
        await serverServices.deleteServer(serverId)
    }, [])

    const deleteChannel = useCallback(
        async (serverId: string, channelId: string) => {
            await serverServices.deleteChannel(serverId, channelId)
        },
        []
    )

    const getPagedChannels = useCallback(
        async (serverId: string, limit: number, offset: number) => {
            const channels = await serverServices.getPagedChannels(
                serverId,
                limit,
                offset
            )
            setServers((prev) => {
                return prev.map((server) => {
                    if (server.id !== serverId) return server

                    const existingChannelIds = new Set(
                        (server.channels || []).map((c) => c.id)
                    )
                    const newChannels = channels.filter(
                        (c) => !existingChannelIds.has(c.id)
                    )
                    return {
                        ...server,
                        channels: [...(server.channels || []), ...newChannels],
                    }
                })
            })
        },
        [setServers]
    )

    const getPagedMessages = useCallback(
        async (
            serverId: string,
            channelId: string,
            limit: number,
            nextPageState?: string
        ) => {
            const data = await messageServices.getPagedMessages(
                serverId,
                channelId,
                limit,
                nextPageState
            )
            setServers((prev) => {
                return prev.map((server) => {
                    return {
                        ...server,
                        channels: server.channels.map((channel) => {
                            if (channel.id !== data.channelId) return channel

                            const existingMessageIds = new Set(
                                (channel.messages || []).map((m) => m.id)
                            )
                            const newMessages = data.messages.filter(
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
                    }
                })
            })
        },
        [setServers]
    )

    const getServerUsers = useCallback(
        async (serverId: string) => {
            let users = await serverServices.getServerUsers(serverId)
            users = users.map((u) => ({
                id: u.id,
                username: u.username,
            }))
            setServers((prev) => {
                return prev.map((s) => {
                    if (s.id === serverId) {
                        return {
                            ...s,
                            users: users,
                        }
                    }
                    return s
                })
            })
        },
        [setServers]
    )

    const changeServer = useCallback(
        (serverId: string) => {
            const server = servers.find((s) => s.id === serverId)
            if (server) {
                setCurrentServerId(serverId)
                const firstChannel = server.channels?.[0]
                setCurrentChannelId(firstChannel?.id || null)
                const room = `server_${serverId}`
                if (!socketService.getJoinedServerRooms().has(room)) {
                    socketService.joinServer(serverId)
                }
                if (!server.channels || server.channels.length === 0) {
                    getPagedChannels(serverId, 50, 0).then(() => {
                        const updatedServer = servers.find(
                            (s) => s.id === serverId
                        )
                        if (
                            updatedServer &&
                            updatedServer.channels.length > 0 &&
                            updatedServer.channels[0]
                        ) {
                            setCurrentChannelId(updatedServer.channels[0].id)
                        }
                    })
                }
            }
        },
        [servers, setCurrentServerId, setCurrentChannelId, getPagedChannels]
    )

    const changeChannel = useCallback(
        async (channelId: string) => {
            setCurrentChannelId(channelId)
            const room = `channel_${channelId}`
            if (!socketService.getJoinedChannelRooms().has(room)) {
                if (currentServerId) {
                    await getPagedMessages(currentServerId, channelId, 50)
                }
                socketService.joinChannel(channelId)
            }
        },
        [currentServerId, setCurrentChannelId, getPagedMessages]
    )

    return {
        getUserServers,
        createServer,
        joinServer,
        createChannel,
        deleteChannel,
        messageServer,
        leaveServer,
        deleteServer,
        changeServer,
        changeChannel,
        getPagedChannels,
        getPagedMessages,
        getServerUsers,
        getJoinedChannelRooms,
        getJoinedServerRooms,
        getUserById,
    }
}
