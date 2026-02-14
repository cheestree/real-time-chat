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
    const addServer = useSocketStore((state) => state.addServer)
    const addChannelToServer = useSocketStore(
        (state) => state.addChannelToServer
    )
    const removeChannel = useSocketStore((state) => state.removeChannel)
    const addUserToServer = useSocketStore((state) => state.addUserToServer)
    const removeUserFromServer = useSocketStore(
        (state) => state.removeUserFromServer
    )
    const removeServer = useSocketStore((state) => state.removeServer)
    const addMessageToChannel = useSocketStore(
        (state) => state.addMessageToChannel
    )
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
            addServer(server)
            setCurrentServerId(server.id)
        }

        const onCreateChannelSuccess = (channel: ChannelDetail) => {
            addChannelToServer(channel.serverId, channel)
            setCurrentChannelId(channel.id)
        }

        const onChannelDeleted = (data: {
            serverId: string
            channelId: string
        }) => {
            removeChannel(data.serverId, data.channelId)
        }

        const onUserJoinedServer = (data: {
            user: UserProfile
            serverId: string
        }) => {
            addUserToServer(data.serverId, data.user)
        }

        const onUserLeftServer = (data: {
            userId: string
            serverId: string
        }) => {
            removeUserFromServer(data.serverId, data.userId)
        }

        const onServerDeleted = (data: { serverId: string }) => {
            removeServer(data.serverId)
        }

        const onMessageReceived = (message: Message) => {
            addMessageToChannel(message.channelId, message)
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
    }, [
        isLoggedIn,
        addServer,
        addChannelToServer,
        removeChannel,
        addUserToServer,
        removeUserFromServer,
        removeServer,
        addMessageToChannel,
        setCurrentServerId,
        setCurrentChannelId,
    ])

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
