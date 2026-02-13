import { UserProfile } from '@/domain/UserProfile'
import { messageService } from '@/services/MessageService'
import { serverService } from '@/services/ServerService'
import { socketService } from '@/services/SocketService'
import { ServerDetail } from '@/types/api.types'
import { Dispatch, SetStateAction, useCallback } from 'react'

interface UseSocketActionsProps {
    servers: ServerDetail[]
    currentServerId: string | null
    currentChannelId: string | null
    setServers: Dispatch<SetStateAction<ServerDetail[]>>
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
        const userServers = await serverService.listServers()
        if (!userServers.success) return

        setServers(userServers.data)
        if (
            userServers.data[0] &&
            userServers.data.length > 0 &&
            !currentServerId
        ) {
            setCurrentServerId(userServers.data[0].id)
            const firstChannel = userServers.data[0].channels?.[0]
            if (firstChannel) {
                setCurrentChannelId(firstChannel.id)
            }
        }
    }, [currentServerId, setServers, setCurrentServerId, setCurrentChannelId])

    const createServer = useCallback(
        async (name: string, description?: string, icon?: string) => {
            const server = await serverService.createServer({
                name,
                description,
                icon,
            })
            if (server.success) {
                setServers((prev) => [...prev, server.data])
                setCurrentServerId(server.data.id)
                setCurrentChannelId(null)
            }
        },
        [setServers, setCurrentServerId, setCurrentChannelId]
    )

    const joinServer = useCallback(
        async (serverId: string) => {
            const rooms = await getJoinedServerRooms()
            if (rooms.has(serverId)) {
                return
            }
            const server = await serverService.joinServer({ serverId })
            if (!server.success) return

            setServers((prev) => [...prev, server.data])
            setCurrentServerId(server.data.id)
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
        async (name: string, description: string) => {
            if (!currentServerId) return

            const response = await serverService.createChannel({
                serverId: currentServerId,
                name,
                description,
            })
            if (!response.success) return

            setServers((prev) => {
                return prev.map((s) => {
                    if (s.id !== currentServerId) return s
                    return {
                        ...s,
                        channels: [
                            ...(s.channels || []),
                            { ...response.data, messages: [] },
                        ],
                    }
                })
            })
        },
        [currentServerId, setServers]
    )

    const messageServer = useCallback(
        (message: string) => {
            if (!currentServerId || !currentChannelId) return
            socketService.messageServer({
                serverId: currentServerId,
                channelId: currentChannelId,
                content: message,
            })
        },
        [currentServerId, currentChannelId]
    )

    const leaveServer = useCallback((serverId: string) => {
        socketService.leaveServer({ serverId })
    }, [])

    const deleteServer = useCallback(async (serverId: string) => {
        await serverService.deleteServer({ serverId })
    }, [])

    const deleteChannel = useCallback(
        async (serverId: string, channelId: string) => {
            await serverService.deleteChannel({ serverId, channelId })
        },
        []
    )

    const getPagedChannels = useCallback(
        async (serverId: string, limit: number, offset: number) => {
            const response = await serverService.getPagedChannels({
                serverId,
                limit,
                offset,
            })
            if (!response.success) return

            setServers((prev) => {
                return prev.map((server) => {
                    if (server.id !== serverId) return server

                    const existingChannelIds = new Set(
                        (server.channels || []).map((c) => c.id)
                    )
                    const newChannels = response.data
                        .filter((c) => !existingChannelIds.has(c.id))
                        .map((c) => ({ ...c, messages: [] }))
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
            const response = await messageService.getPagedMessages({
                serverId,
                channelId,
                limit,
                nextPageState,
            })
            if (!response.success) return

            setServers((prev) => {
                return prev.map((server) => {
                    return {
                        ...server,
                        channels: server.channels.map((channel) => {
                            if (channel.id !== response.data.channelId)
                                return channel

                            const existingMessageIds = new Set(
                                (channel.messages || []).map((m) => m.id)
                            )
                            const newMessages = response.data.messages.filter(
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
            const response = await serverService.getServerUsers({ serverId })
            if (!response.success) return

            const users = response.data.map((u) => ({
                id: u.id,
                username: u.username,
            }))
            setServers((prev) => {
                return prev.map((s) => {
                    if (s.id === serverId) {
                        return {
                            ...s,
                            users,
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
                    socketService.joinServer({ serverId })
                }
            }
        },
        [servers, setCurrentServerId, setCurrentChannelId]
    )

    const changeChannel = useCallback(
        async (channelId: string) => {
            setCurrentChannelId(channelId)
            const room = `channel_${channelId}`
            if (!socketService.getJoinedChannelRooms().has(room)) {
                if (currentServerId) {
                    await getPagedMessages(currentServerId, channelId, 50)
                }
                socketService.joinChannel({ channelId })
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
