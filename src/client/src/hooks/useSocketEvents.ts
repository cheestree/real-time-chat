import { Message } from '@/domain/Message'
import { UserProfile } from '@/domain/UserProfile'
import { socketService } from '@/services/SocketService'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSocketStore } from '@/stores/useSocketStore'
import { ChannelDetail, ServerDetail } from '@rtchat/shared'
import { useEffect } from 'react'

/**
 * Custom hook that manages all socket event listeners
 * Automatically subscribes to socket events and cleans up on unmount
 */
export function useSocketEvents() {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

    useEffect(() => {
        if (!isLoggedIn) return

        // Initialize socket connection
        socketService.init()

        // Server Events
        const onServerCreated = (server: ServerDetail) => {
            useSocketStore.getState().addServer(server)
            useSocketStore.getState().setCurrentServerId(server.id)
        }

        const onServerDeleted = (data: { serverId: string }) => {
            useSocketStore.getState().removeServer(data.serverId)
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

        // Channel Events
        const onChannelCreated = (channel: ChannelDetail) => {
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

        // Message Events
        const onMessageReceived = (message: Message) => {
            useSocketStore
                .getState()
                .addMessageToChannel(message.channelId, message)
        }

        // Direct Message Events
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

        // Register all event listeners
        socketService.on('serverCreated', onServerCreated)
        socketService.on('serverDeleted', onServerDeleted)
        socketService.on('userJoinedServer', onUserJoinedServer)
        socketService.on('userLeftServer', onUserLeftServer)
        socketService.on('channelCreated', onChannelCreated)
        socketService.on('channelDeleted', onChannelDeleted)
        socketService.on('messageSent', onMessageReceived)
        socketService.on('dmSent', onDMReceived)

        // Cleanup: Remove all event listeners
        return () => {
            socketService.off('serverCreated', onServerCreated)
            socketService.off('serverDeleted', onServerDeleted)
            socketService.off('userJoinedServer', onUserJoinedServer)
            socketService.off('userLeftServer', onUserLeftServer)
            socketService.off('channelCreated', onChannelCreated)
            socketService.off('channelDeleted', onChannelDeleted)
            socketService.off('messageSent', onMessageReceived)
            socketService.off('dmSent', onDMReceived)
            socketService.disconnect()
        }
    }, [isLoggedIn])
}
