import { Channel } from '@/domain/Channel'
import { Server } from '@/domain/Server'
import { UserProfile } from '@/domain/UserProfile'
import { messageServices } from '@/services/MessageServices'
import { serverServices } from '@/services/ServerServices'
import { socketService } from '@/services/SocketService'
import React from 'react'

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
    async function getUserServers() {
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
                initializedServers[0].channels.length > 0
            ) {
                if (initializedServers[0].channels[0])
                    setCurrentChannelId(initializedServers[0].channels[0].id)
            }
        }
    }

    async function createServer(
        serverName: string,
        serverDescription?: string,
        serverIcon?: string
    ) {
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
    }

    async function joinServer(serverId: string) {
        const server = await serverServices.joinServer(serverId)
        if (await getJoinedServerRooms().then((rooms) => rooms.has(serverId))) {
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
        setCurrentChannelId(null) // Will be set when channels are fetched
    }

    async function createChannel(
        channelName: string,
        channelDescription: string
    ) {
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
    }

    function messageServer(message: string) {
        if (!currentServerId || !currentChannelId) return

        socketService.messageServer(currentServerId, currentChannelId, message)
    }

    function leaveServer(serverId: string) {
        socketService.leaveServer(serverId)
    }

    async function deleteServer(serverId: string) {
        await serverServices.deleteServer(serverId)
    }

    async function deleteChannel(serverId: string, channelId: string) {
        await serverServices.deleteChannel(serverId, channelId)
    }

    function changeServer(serverId: string) {
        const server = servers.find((s) => s.id === serverId)
        if (server) {
            setCurrentServerId(serverId)
            const firstChannel = server.channels?.[0]
            setCurrentChannelId(firstChannel?.id || null)
            const room = `server_${serverId}`
            if (!socketService.getJoinedServerRooms().has(room)) {
                socketService.joinServer(serverId)
            }
        }
    }

    async function changeChannel(channelId: string) {
        setCurrentChannelId(channelId)
        const room = `channel_${channelId}`
        if (!socketService.getJoinedChannelRooms().has(room)) {
            // Fetch messages before joining the room
            if (currentServerId) {
                await getPagedMessages(currentServerId, channelId, 50)
            }
            socketService.joinChannel(channelId)
        }
    }

    async function getPagedChannels(
        serverId: string,
        limit: number,
        offset: number
    ) {
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
    }

    async function getPagedMessages(
        serverId: string,
        channelId: string,
        limit: number,
        nextPageState?: string
    ) {
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

                        return {
                            ...channel,
                            messages: [
                                ...(channel.messages || []),
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

    async function getServerUsers(serverId: string) {
        const users = await serverServices.getServerUsers(serverId)
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
    }

    async function getJoinedChannelRooms(): Promise<ReadonlySet<string>> {
        return socketService.getJoinedChannelRooms()
    }

    async function getJoinedServerRooms(): Promise<ReadonlySet<string>> {
        return socketService.getJoinedServerRooms()
    }

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
    }
}
