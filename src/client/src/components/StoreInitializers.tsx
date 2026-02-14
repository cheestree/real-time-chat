'use client'

import { Message } from '@/domain/Message'
import { UserProfile } from '@/domain/UserProfile'
import { socketService } from '@/services/SocketService'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSocketStore } from '@/stores/useSocketStore'
import { ChannelDetail, ServerDetail } from '@/types/api.types'
import { ReactNode, useEffect } from 'react'

export function SocketInitializer() {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
    const getUserServers = useSocketStore((state) => state.getUserServers)
    const setServers = useSocketStore((state) => state.setServers)
    const setCurrentServerId = useSocketStore(
        (state) => state.setCurrentServerId
    )
    const setCurrentChannelId = useSocketStore(
        (state) => state.setCurrentChannelId
    )

    useEffect(() => {
        if (!isLoggedIn) return

        socketService.init()

        const onCreateServerSuccess = (server: ServerDetail) => {
            if (!server.channels) server.channels = []
            if (!server.users) server.users = []
            setServers(useSocketStore.getState().servers.concat(server))
            setCurrentServerId(server.id)
        }

        const onCreateChannelSuccess = (channel: ChannelDetail) => {
            if (!channel.messages) channel.messages = []
            setServers(
                useSocketStore.getState().servers.map((server) => {
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
            )
        }

        const onChannelDeleted = (data: {
            serverId: string
            channelId: string
        }) => {
            setServers(
                useSocketStore.getState().servers.map((server) => {
                    if (server.id !== data.serverId) return server
                    return {
                        ...server,
                        channels: server.channels.filter(
                            (ch) => ch.id !== data.channelId
                        ),
                    }
                })
            )
        }

        const onUserJoinedServer = (data: {
            user: UserProfile
            serverId: string
        }) => {
            const { user, serverId } = data
            setServers(
                useSocketStore.getState().servers.map((server) => {
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
            )
        }

        const onUserLeftServer = (data: {
            userId: string
            serverId: string
        }) => {
            const { userId, serverId } = data
            setServers(
                useSocketStore.getState().servers.map((server) => {
                    if (server.id !== serverId) return server
                    return {
                        ...server,
                        users: server.users.filter((u) => u.id !== userId),
                    }
                })
            )
        }

        const onServerDeleted = (data: { serverId: string }) => {
            setServers(
                useSocketStore
                    .getState()
                    .servers.filter((s) => s.id !== data.serverId)
            )
        }

        const onMessageReceived = (message: Message) => {
            setServers(
                useSocketStore.getState().servers.map((server) => {
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
            )
        }

        socketService.on('serverCreated', onCreateServerSuccess)
        socketService.on('channelCreated', onCreateChannelSuccess)
        socketService.on('channelDeleted', onChannelDeleted)
        socketService.on('userJoinedServer', onUserJoinedServer)
        socketService.on('userLeftServer', onUserLeftServer)
        socketService.on('serverDeleted', onServerDeleted)
        socketService.on('messageSent', onMessageReceived)

        return () => {
            socketService.off('serverCreated', onCreateServerSuccess)
            socketService.off('channelCreated', onCreateChannelSuccess)
            socketService.off('channelDeleted', onChannelDeleted)
            socketService.off('userJoinedServer', onUserJoinedServer)
            socketService.off('userLeftServer', onUserLeftServer)
            socketService.off('serverDeleted', onServerDeleted)
            socketService.off('messageSent', onMessageReceived)
            socketService.disconnect()
        }
    }, [isLoggedIn, setServers, setCurrentServerId, setCurrentChannelId])

    useEffect(() => {
        if (isLoggedIn) {
            getUserServers()
        }
    }, [isLoggedIn, getUserServers])

    return null
}

export function AuthInitializer() {
    const checkAuth = useAuthStore((state) => state.checkAuth)

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    return null
}

export function StoreInitializers({ children }: { children: ReactNode }) {
    return (
        <>
            <AuthInitializer />
            <SocketInitializer />
            {children}
        </>
    )
}
