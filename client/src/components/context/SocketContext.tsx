'use client'

import { Channel } from '@/domain/Channel'
import { Server } from '@/domain/Server'
import { Message } from '@/domain/Message'
import { UserProfile } from '@/domain/UserProfile'
import { socketService } from '@/services/SocketService'
import { SocketContextType } from '@/types/socket.types'
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react'


const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: ReactNode }) {
    const [servers, setServers] = useState<Server[]>([])
    const [currentServer, setCurrentServer] = useState(0)
    const [currentChannel, setCurrentChannel] = useState(0)

    function getUserServers() {
        socketService.getUserServers()
    }

    function joinServer(serverId: number) {
        socketService.joinServer(serverId)
    }

    function createServer(serverName: string, serverDescription: string, serverIcon: string) {
        socketService.createServer(serverName, serverDescription, serverIcon)
    }

    function createChannel(channelName: string, channelDescription: string) {
        const server = servers[currentServer]
        if (!server) return

        socketService.createChannel(server.id, channelName, channelDescription)
    }

    function messageServer(message: string) {
        const server = servers[currentServer]
        const channel = server?.channels[currentChannel]
        if (!server || !channel) return

        socketService.messageServer(server.id, channel.id, message)
    }

    function leaveServer(serverId: number) {
        socketService.leaveServer(serverId)
    }

    function deleteServer(serverId: number) {
        socketService.deleteServer(serverId)
    }

    function changeServer(serverId: number) {
        const server = servers.findIndex((s) => s.id == serverId)
        setCurrentServer(server)
    }

    function changeChannel(channelId: number) {
        const server = servers[currentServer]
        if (!server) return

        const channel = server.channels.findIndex((s) => s.id == channelId)
        setCurrentChannel(channel)
    }

    useEffect(() => {
        function onUserServersSuccess(servers: Server[]) {
            setServers(servers)
        }

        function onCreateServerSuccess(server: Server) {
            setServers((prev) => [...prev, server])
            setCurrentServer(servers.length - 1)
        }

        function onJoinServerSuccess(server: Server) {
            setServers((prev) => [...prev, server])
            setCurrentServer(servers.length - 1)
        }

        function onCreateChannelSuccess(data: {
            serverId: number
            channel: Channel
        }) {
            const { serverId, channel } = data

            setServers((prev) => {
                return prev.map((server) => {
                    if (server.id !== serverId) return server
                    setCurrentChannel(server.channels.length - 1)
                    return {
                        ...server,
                        channels: [...server.channels, channel],
                    }
                })
            })
        }

        function onMemberJoinSuccess(data: {
            user: UserProfile
            serverId: number
        }) {
            const { user, serverId } = data

            setServers((prev) => {
                return prev.map((server) => {
                    if (server.id !== serverId) return server
                    return {
                        ...server,
                        users: [...server.users, user],
                    }
                })
            })
        }

        function onMessageServerSuccess(data: {
            serverId: number
            channelId: number
            message: Message
        }) {
            setServers((prevState) => {
                return prevState.map((server) => {
                    if (server.id !== data.serverId) return server
                    return {
                        ...server,
                        channels: server.channels.map((channel) => {
                            if (channel.id === data.channelId) {
                                return {
                                    ...channel,
                                    messages: [
                                        ...channel.messages,
                                        data.message,
                                    ],
                                }
                            }
                            return channel
                        }),
                    }
                })
            })
        }

        function onLeaveServerSuccess(serverId: number) {
            setServers((prevState) => {
                return prevState.filter((s) => s.id != serverId)
            })
        }

        function onDeleteServerSuccess(serverId: number) {
            setServers((prevState) => {
                return prevState.filter((s) => s.id != serverId)
            })
        }

        getUserServers()

        socketService.on('userServersSuccess', onUserServersSuccess)
        socketService.on('joinServerSuccess', onJoinServerSuccess)
        socketService.on('createServerSuccess', onCreateServerSuccess)
        socketService.on('memberJoined', onMemberJoinSuccess)
        socketService.on('createChannelSuccess', onCreateChannelSuccess)
        socketService.on('messageServerSuccess', onMessageServerSuccess)
        socketService.on('leaveServerSuccess', onLeaveServerSuccess)
        socketService.on('deleteServerSuccess', onDeleteServerSuccess)

        return () => {
            socketService.off('userServersSuccess', onUserServersSuccess)
            socketService.off('joinServerSuccess', onJoinServerSuccess)
            socketService.off('createServerSuccess', onCreateServerSuccess)
            socketService.off('memberJoined', onMemberJoinSuccess)
            socketService.off('createChannelSuccess', onCreateChannelSuccess)
            socketService.off('messageServerSuccess', onMessageServerSuccess)
            socketService.off('leaveServerSuccess', onLeaveServerSuccess)
            socketService.off('deleteServerSuccess', onDeleteServerSuccess)
        }
    }, [])

    return (
        <SocketContext.Provider
            value={{
                createServer,
                joinServer,
                createChannel,
                messageServer,
                leaveServer,
                deleteServer,
                changeServer,
                currentServer,
                currentChannel,
                changeChannel,
                servers,
            }}
        >
            {children}
        </SocketContext.Provider>
    )
}

export function useSocket() {
    const context = useContext(SocketContext)
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider')
    }
    return context
}
