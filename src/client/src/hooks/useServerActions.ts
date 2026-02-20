import { useSocketStore } from '@/stores/useSocketStore'

/**
 * Hook providing server-related actions and state
 */
export function useServerActions() {
    const servers = useSocketStore((state) => state.servers)
    const currentServerId = useSocketStore((state) => state.currentServerId)
    const currentServer = useSocketStore((state) => state.currentServer)

    const createServer = useSocketStore((state) => state.createServer)
    const joinServer = useSocketStore((state) => state.joinServer)
    const leaveServer = useSocketStore((state) => state.leaveServer)
    const deleteServer = useSocketStore((state) => state.deleteServer)
    const changeServer = useSocketStore((state) => state.changeServer)
    const getServerUsers = useSocketStore((state) => state.getServerUsers)

    return {
        // State
        servers,
        currentServerId,
        currentServer,

        // Actions
        createServer,
        joinServer,
        leaveServer,
        deleteServer,
        changeServer,
        getServerUsers,
    }
}
