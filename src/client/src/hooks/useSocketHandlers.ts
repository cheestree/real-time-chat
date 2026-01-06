import { Channel } from '@/domain/Channel'
import { Message } from '@/domain/Message'
import { Server } from '@/domain/Server'
import { UserProfile } from '@/domain/UserProfile'
import { socketService } from '@/services/SocketService'
import React, { useEffect } from 'react'

interface UseSocketHandlersProps {
    setServers: React.Dispatch<React.SetStateAction<Server[]>>
    setCurrentServerId: React.Dispatch<React.SetStateAction<string | null>>
    setCurrentChannelId: React.Dispatch<React.SetStateAction<string | null>>
    servers: Server[]
}

export function useSocketHandlers({
    setServers,
    setCurrentServerId,
    setCurrentChannelId,
    servers,
}: UseSocketHandlersProps) {
    useEffect(() => {
        function onCreateServerSuccess(server: Server) {
            if (!server.channels) server.channels = []
            if (!server.users) server.users = []
            if (!server.channelIds) server.channelIds = []
            if (!server.userIds) server.userIds = []
            if (!server.ownerIds) server.ownerIds = []

            setServers((prev) => [...prev, server])
            setCurrentServerId(server.id)
        }

        function onCreateChannelSuccess(channel: Channel) {
            if (!channel.messages) channel.messages = []

            setServers((prev) => {
                return prev.map((server) => {
                    if (server.id !== channel.serverId) return server

                    if (!server.channelIds) server.channelIds = []
                    if (!server.channelIds.includes(channel.id)) {
                        server.channelIds.push(channel.id)
                    }

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
        }

        function onChannelDeleted(data: {
            serverId: string
            channelId: string
        }) {
            setServers((prev) => {
                return prev.map((server) => {
                    if (server.id !== data.serverId) return server
                    return {
                        ...server,
                        channels: server.channels.filter(
                            (ch) => ch.id !== data.channelId
                        ),
                        channelIds: server.channelIds.filter(
                            (id) => id !== data.channelId
                        ),
                    }
                })
            })
        }

        function onUserJoinedServer(data: {
            user: UserProfile
            serverId: string
        }) {
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
        }

        function onMessageServerSuccess(message: Message) {
            setServers((prevState) => {
                return prevState.map((server) => {
                    return {
                        ...server,
                        channels: server.channels.map((channel) => {
                            if (channel.id === message.channelId) {
                                const currentMessages = channel.messages || []
                                // Avoid duplicates
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
        }

        function onUserLeftServer(data: {
            profile: UserProfile
            serverId: string
        }) {
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
        }

        function onDeleteServerSuccess(serverId: string) {
            setServers((prevState) => {
                return prevState.filter((s) => s.id !== serverId)
            })
        }

        function onChannelsPaged(data: {
            channels: Channel[]
            serverId: string
        }) {
            setServers((prev) => {
                return prev.map((server) => {
                    if (server.id !== data.serverId) return server

                    // Ensure all channels have messages array initialized
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
        }

        function onMessagesPaged(data: {
            messages: Message[]
            nextPageState?: string
            channelId: string
        }) {
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
        }

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
    }, [setServers, setCurrentServerId, setCurrentChannelId, servers.length])
}
