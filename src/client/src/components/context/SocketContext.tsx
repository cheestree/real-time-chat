'use client'

import { Server } from '@/domain/Server'
import { useSocketActions } from '@/hooks/useSocketActions'
import { useSocketHandlers } from '@/hooks/useSocketHandlers'
import { socketService } from '@/services/SocketService'
import { SocketContextType } from '@/types/socket.types'
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: ReactNode }) {
    const [servers, setServers] = useState<Server[]>([])
    const [currentServerId, setCurrentServerId] = useState<string | null>(null)
    const [currentChannelId, setCurrentChannelId] = useState<string | null>(
        null
    )

    useEffect(() => {
        socketService.init()
        return () => socketService.disconnect()
    }, [])

    const fetchedDataRef = useRef<{
        channels: Set<string>
        users: Set<string>
        messages: Set<string>
    }>({
        channels: new Set(),
        users: new Set(),
        messages: new Set(),
    })

    useSocketHandlers({
        setServers,
        setCurrentServerId,
        setCurrentChannelId,
        servers,
    })

    const {
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
        getUserById,
    } = useSocketActions({
        servers,
        currentServerId,
        currentChannelId,
        setServers,
        setCurrentServerId,
        setCurrentChannelId,
    })

    // Computed values for convenience
    const currentServer = useMemo(
        () =>
            currentServerId
                ? servers.find((s) => s.id === currentServerId) || null
                : null,
        [currentServerId, servers]
    )

    const currentChannel = useMemo(
        () =>
            currentServer && currentChannelId
                ? currentServer.channels.find(
                      (c) => c.id === currentChannelId
                  ) || null
                : null,
        [currentServer, currentChannelId]
    )

    useEffect(() => {
        getUserServers()
    }, [getUserServers])

    useEffect(() => {
        const fetchDataForCurrentSelection = async () => {
            if (!currentServerId) {
                return
            }

            const server = servers.find((s) => s.id === currentServerId)

            if (!server) {
                return
            }

            if (
                server.channels.length === 0 &&
                server.channelIds &&
                server.channelIds.length > 0 &&
                !fetchedDataRef.current.channels.has(currentServerId)
            ) {
                fetchedDataRef.current.channels.add(currentServerId)
                await getPagedChannels(server.id, 50, 0)
                const updatedServer = servers.find(
                    (s) => s.id === currentServerId
                )
                if (
                    !currentChannelId &&
                    updatedServer &&
                    updatedServer.channels.length > 0
                ) {
                    const firstChannel = updatedServer.channels[0]
                    setCurrentChannelId(firstChannel ? firstChannel.id : null)
                }
            }

            if (
                (server.users.length === 0 ||
                    server.users.length < (server.userIds?.length || 0)) &&
                server.userIds &&
                server.userIds.length > 0 &&
                !fetchedDataRef.current.users.has(currentServerId)
            ) {
                fetchedDataRef.current.users.add(currentServerId)
                await getServerUsers(server.id)
            }
        }

        fetchDataForCurrentSelection()
    }, [
        currentServerId,
        currentChannelId,
        servers,
        getPagedChannels,
        getServerUsers,
    ])

    const contextValue = useMemo(
        () => ({
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
            getUserById,
            currentServerId,
            currentChannelId,
            currentServer,
            currentChannel,
            servers,
        }),
        [
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
            getUserById,
            currentServerId,
            currentChannelId,
            currentServer,
            currentChannel,
            servers,
        ]
    )

    return (
        <SocketContext.Provider value={contextValue}>
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
