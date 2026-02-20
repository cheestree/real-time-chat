'use client'

import { Message } from '@/domain/Message'
import { UserProfile } from '@/domain/UserProfile'
import { socketService } from '@/services/SocketService'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSocketStore } from '@/stores/useSocketStore'
import { ChannelDetail, ServerDetail } from '@rtchat/shared'
import { ReactNode, useEffect } from 'react'

export function SocketInitializer() {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

    useEffect(() => {
        if (!isLoggedIn) return

        socketService.init()

        const onCreateServerSuccess = (server: ServerDetail) => {
            useSocketStore.getState().addServer(server)
            useSocketStore.getState().setCurrentServerId(server.id)
        }

        const onCreateChannelSuccess = (channel: ChannelDetail) => {
            useSocketStore
                .getState()
                .addChannelToServer(channel.serverId, channel)
        }

        const onChannelDeleted = (data: {
            serverId: string
            channelId: string
        }) => {
            useSocketStore
                .getState()
                .removeChannel(data.serverId, data.channelId)
        }

        const onUserJoinedServer = (data: {
            serverId: string
            user: UserProfile
        }) => {
            useSocketStore.getState().addUserToServer(data.serverId, data.user)
        }

        const onUserLeftServer = (data: {
            serverId: string
            profile: UserProfile
        }) => {
            useSocketStore
                .getState()
                .removeUserFromServer(data.serverId, data.profile.id)
        }

        const onServerDeleted = (data: { serverId: string }) => {
            useSocketStore.getState().removeServer(data.serverId)
        }

        const onMessageReceived = (message: Message) => {
            useSocketStore
                .getState()
                .addMessageToChannel(message.channelId, message)
        }

        const onDMReceived = (data: any) => {
            const currentUser = useAuthStore.getState().loggedUser
            if (!currentUser) return

            const otherUserId =
                data.senderId === currentUser.publicId
                    ? data.recipientId
                    : data.senderId
            const otherUsername =
                data.senderId === currentUser.publicId
                    ? ''
                    : data.authorUsername

            useSocketStore
                .getState()
                .addMessageToConversation(otherUserId, otherUsername, {
                    id: data.id,
                    senderId: data.senderId,
                    recipientId: data.recipientId,
                    content: data.content,
                    timestamp: data.timestamp,
                    authorUsername: data.authorUsername,
                    authorIcon: data.authorIcon,
                })
        }

        socketService.on('serverCreated', onCreateServerSuccess)
        socketService.on('channelCreated', onCreateChannelSuccess)
        socketService.on('channelDeleted', onChannelDeleted)
        socketService.on('userJoinedServer', onUserJoinedServer)
        socketService.on('userLeftServer', onUserLeftServer)
        socketService.on('serverDeleted', onServerDeleted)
        socketService.on('messageSent', onMessageReceived)
        socketService.on('dmSent', onDMReceived)

        return () => {
            socketService.off('serverCreated', onCreateServerSuccess)
            socketService.off('channelCreated', onCreateChannelSuccess)
            socketService.off('channelDeleted', onChannelDeleted)
            socketService.off('userJoinedServer', onUserJoinedServer)
            socketService.off('userLeftServer', onUserLeftServer)
            socketService.off('serverDeleted', onServerDeleted)
            socketService.off('messageSent', onMessageReceived)
            socketService.off('dmSent', onDMReceived)
            socketService.disconnect()
        }
    }, [isLoggedIn])

    useEffect(() => {
        if (isLoggedIn) {
            useSocketStore.getState().getUserServers()
        }
    }, [isLoggedIn])

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
