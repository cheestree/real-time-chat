import { Message } from '@/domain/Message'
import { UserProfile } from '@/domain/UserProfile'
import { socketService } from '@/services/SocketService'
import { ChannelDetail, ServerDetail } from '@rtchat/shared'
import { Dispatch, SetStateAction, useCallback, useEffect } from 'react'

interface UseSocketHandlersProps {
    setServers: Dispatch<SetStateAction<ServerDetail[]>>
    setCurrentServerId: Dispatch<SetStateAction<string | null>>
    setCurrentChannelId: Dispatch<SetStateAction<string | null>>
}

export function useSocketHandlers({
    setServers,
    setCurrentServerId,
    setCurrentChannelId,
}: UseSocketHandlersProps) {
    const onCreateServerSuccess = useCallback(
        (server: ServerDetail) => {
            if (!server.channels) server.channels = []
            if (!server.users) server.users = []

            setServers((prev) => [...prev, server])
            setCurrentServerId(server.id)
        },
        [setServers, setCurrentServerId]
    )

    const onCreateChannelSuccess = useCallback(
        (channel: ChannelDetail) => {
            if (!channel.messages) channel.messages = []

            setServers((prev) => {
                return prev.map((server) => {
                    if (server.id !== channel.serverId) return server

                    if (!server.channels) server.channels = []
                    const channelExists = server.channels.some(
                        (ch) => ch.id === channel.id
                    )
                    if (!channelExists) {
                        setCurrentChannelId(channel.id)
                        return {
                            ...server,
                            channels: [...server.channels, channel],
                        }
                    }
                    return server
                })
            })
        },
        [setServers, setCurrentChannelId]
    )

    const onChannelDeleted = useCallback(
        (data: { serverId: string; channelId: string }) => {
            setServers((prev) => {
                return prev.map((server) => {
                    if (server.id !== data.serverId) return server
                    return {
                        ...server,
                        channels: server.channels.filter(
                            (ch) => ch.id !== data.channelId
                        ),
                    }
                })
            })
        },
        [setServers]
    )

    const onUserJoinedServer = useCallback(
        (data: { user: UserProfile; serverId: string }) => {
            const { user, serverId } = data

            setServers((prev) => {
                return prev.map((server) => {
                    if (server.id !== serverId) return server
                    const userExists = server.users.some(
                        (u) => u.id === user.id
                    )
                    if (!userExists) {
                        return {
                            ...server,
                            users: [...server.users, user],
                        }
                    }
                    return server
                })
            })
        },
        [setServers]
    )

    const onMessageServerSuccess = useCallback(
        (message: Message) => {
            setServers((prevState) => {
                return prevState.map((server) => {
                    return {
                        ...server,
                        channels: server.channels.map((channel) => {
                            if (channel.id === message.channelId) {
                                const currentMessages = channel.messages || []
                                const messageExists = currentMessages.some(
                                    (m) => m.id === message.id
                                )
                                if (messageExists) return channel

                                return {
                                    ...channel,
                                    messages: [...currentMessages, message],
                                }
                            }
                            return channel
                        }),
                    }
                })
            })
        },
        [setServers]
    )

    const onUserLeftServer = useCallback(
        (data: { profile: UserProfile; serverId: string }) => {
            setServers((prevState) => {
                return prevState.map((server) => {
                    if (server.id !== data.serverId) return server
                    if (!server.users) server.users = []
                    return {
                        ...server,
                        users: server.users.filter(
                            (u) => u.id !== data.profile.id
                        ),
                    }
                })
            })
        },
        [setServers]
    )

    const onDeleteServerSuccess = useCallback(
        (serverId: string) => {
            setServers((prevState) => {
                return prevState.filter((s) => s.id !== serverId)
            })
        },
        [setServers]
    )

    const onChannelsPaged = useCallback(
        (data: { channels: ChannelDetail[]; serverId: string }) => {
            setServers((prev) => {
                return prev.map((server) => {
                    if (server.id !== data.serverId) return server

                    const channelsWithMessages = data.channels.map((ch) => ({
                        ...ch,
                        messages: ch.messages || [],
                    }))

                    const existingChannelIds = new Set(
                        server.channels.map((c) => c.id)
                    )
                    const newChannels = channelsWithMessages.filter(
                        (c) => !existingChannelIds.has(c.id)
                    )

                    return {
                        ...server,
                        channels: [...server.channels, ...newChannels],
                    }
                })
            })
        },
        [setServers]
    )

    const onMessagesPaged = useCallback(
        (data: {
            messages: Message[]
            nextPageState?: string
            channelId: string
        }) => {
            setServers((prev) => {
                return prev.map((server) => {
                    return {
                        ...server,
                        channels: server.channels.map((channel) => {
                            if (channel.id !== data.channelId) return channel

                            const currentMessages = channel.messages || []
                            const existingMessageIds = new Set(
                                currentMessages.map((m) => m.id)
                            )
                            const newMessages = data.messages.filter(
                                (m) => !existingMessageIds.has(m.id)
                            )

                            return {
                                ...channel,
                                messages: [
                                    ...currentMessages,
                                    ...newMessages,
                                ].sort(
                                    (a, b) =>
                                        new Date(a.timestamp).getTime() -
                                        new Date(b.timestamp).getTime()
                                ),
                            }
                        }),
                    }
                })
            })
        },
        [setServers]
    )

    useEffect(() => {
        socketService.on('serverCreated', onCreateServerSuccess)
        socketService.on('userJoinedServer', onUserJoinedServer)
        socketService.on('channelCreated', onCreateChannelSuccess)
        socketService.on('channelDeleted', onChannelDeleted)
        socketService.on('messageSent', onMessageServerSuccess)
        socketService.on('userLeftServer', onUserLeftServer)
        socketService.on('serverDeleted', onDeleteServerSuccess)
        socketService.on('channelsPaged', onChannelsPaged)
        socketService.on('messagesPaged', onMessagesPaged)

        return () => {
            socketService.off('serverCreated', onCreateServerSuccess)
            socketService.off('userJoinedServer', onUserJoinedServer)
            socketService.off('channelCreated', onCreateChannelSuccess)
            socketService.off('channelDeleted', onChannelDeleted)
            socketService.off('messageSent', onMessageServerSuccess)
            socketService.off('userLeftServer', onUserLeftServer)
            socketService.off('serverDeleted', onDeleteServerSuccess)
            socketService.off('channelsPaged', onChannelsPaged)
            socketService.off('messagesPaged', onMessagesPaged)
        }
    }, [
        onCreateServerSuccess,
        onUserJoinedServer,
        onCreateChannelSuccess,
        onChannelDeleted,
        onMessageServerSuccess,
        onUserLeftServer,
        onDeleteServerSuccess,
        onChannelsPaged,
        onMessagesPaged,
    ])
}
