'use client'

import { CustomChannel } from '@/components/domain/CustomChannel'
import { CustomServer } from '@/components/domain/CustomServer'
import { Message } from '@/components/domain/Message'
import { UserProfile } from '@/components/domain/UserProfile'
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react'
import { io } from 'socket.io-client'

interface SocketContextType {
    createServer: (
        serverName: string,
        serverDescription: string,
        serverIcon: string
    ) => void
    joinServer: (serverId: number) => void
    createChannel: (channelName: string, channelDescription: string) => void
    messageServer: (message: string) => void
    leaveServer: (serverId: number) => void
    deleteServer: (serverId: number) => void
    changeServer: (serverId: number) => void
    changeChannel: (channelId: number) => void
    currentServer: number
    currentChannel: number
    servers: CustomServer[]
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

const API_URL = 'http://localhost:4000'
const socket = io(API_URL, {
    withCredentials: true,
})

export function SocketProvider({ children }: { children: ReactNode }) {
    const [servers, setServers] = useState<CustomServer[]>([])
    const [currentServer, setCurrentServer] = useState(0)
    const [currentChannel, setCurrentChannel] = useState(0)

    function getUserServers() {
        socket.emit('userServers')
    }

    function createServer(
        serverName: string,
        serverDescription: string,
        serverIcon: string
    ) {
        socket.emit('createServer', {
            serverName: serverName,
            serverDescription: serverDescription,
            serverIcon: serverIcon,
        })
    }

    function joinServer(serverId: number) {
        socket.emit('joinServer', { serverId: serverId })
    }

    function createChannel(channelName: string, channelDescription: string) {
        socket.emit('createChannel', {
            serverId: servers[currentServer].id,
            channelName: channelName,
            channelDescription: channelDescription,
        })
    }

    function messageServer(message: string) {
        socket.emit('messageServer', {
            serverId: servers[currentServer].id,
            channelId: servers[currentServer].channels[currentChannel].id,
            message: message,
        })
    }

    function leaveServer(serverId: number) {
        socket.emit('leaveServer', { serverId: serverId })
    }

    function deleteServer(serverId: number) {
        socket.emit('deleteServer', { serverId: serverId })
    }

    function changeServer(serverId: number) {
        const server = servers.findIndex((s) => s.id == serverId)
        setCurrentServer(server)
    }

    function changeChannel(channelId: number) {
        const channel = servers[currentServer].channels.findIndex(
            (s) => s.id == channelId
        )
        setCurrentChannel(channel)
    }

    useEffect(() => {
        function onUserServersSuccess(servers: CustomServer[]) {
            setServers(servers)
        }

        function onCreateServerSuccess(server: CustomServer) {
            setServers((prev) => [...prev, server])
            setCurrentServer(servers.length - 1)
        }

        function onJoinServerSuccess(server: CustomServer) {
            setServers((prev) => [...prev, server])
            setCurrentServer(servers.length - 1)
        }

        function onCreateChannelSuccess(data: {
            serverId: number
            channel: CustomChannel
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

        socket.on('userServersSuccess', onUserServersSuccess)
        socket.on('createServerSuccess', onCreateServerSuccess)
        socket.on('joinServerSuccess', onJoinServerSuccess)
        socket.on('memberJoined', onMemberJoinSuccess)
        socket.on('createChannelSuccess', onCreateChannelSuccess)
        socket.on('messageServerSuccess', onMessageServerSuccess)
        socket.on('leaveServerSuccess', onLeaveServerSuccess)
        socket.on('deleteServerSuccess', onDeleteServerSuccess)

        return () => {
            socket.off('userServersSuccess', onUserServersSuccess)
            socket.off('createServerSuccess', onCreateServerSuccess)
            socket.off('joinServerSuccess', onJoinServerSuccess)
            socket.off('memberJoined', onMemberJoinSuccess)
            socket.off('createChannelSuccess', onCreateChannelSuccess)
            socket.off('messageServerSuccess', onMessageServerSuccess)
            socket.off('leaveServerSuccess', onLeaveServerSuccess)
            socket.off('deleteServerSuccess', onDeleteServerSuccess)
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
