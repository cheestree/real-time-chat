'use client'

import { useSocketActions } from '@/hooks/useSocketActions'
import { useSocketHandlers } from '@/hooks/useSocketHandlers'
import { socketService } from '@/services/SocketService'
import { ServerDetail } from '@/types/api.types'
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
    const [servers, setServers] = useState<ServerDetail[]>([])
    const [currentServerId, setCurrentServerId] = useState<string | null>(null)
    const [currentChannelId, setCurrentChannelId] = useState<string | null>(
        null
    )

    useEffect(() => {
        socketService.init()
        return () => socketService.disconnect()
    }, [])

    const fetchedDataRef = useRef<{
        messages: Set<string>
    }>({
        messages: new Set(),
    })

    useSocketHandlers({
        setServers,
        setCurrentServerId,
        setCurrentChannelId,
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
            if (!currentServerId || !currentChannelId) {
                return
            }

            const channel = servers
                .find((s) => s.id === currentServerId)
                ?.channels.find((c) => c.id === currentChannelId)

            if (
                channel &&
                (!channel.messages || channel.messages.length === 0) &&
                !fetchedDataRef.current.messages.has(currentChannelId)
            ) {
                fetchedDataRef.current.messages.add(currentChannelId)
                await getPagedMessages(currentServerId, currentChannelId, 50)
            }
        }

        fetchDataForCurrentSelection()
    }, [currentServerId, currentChannelId, servers, getPagedMessages])

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
