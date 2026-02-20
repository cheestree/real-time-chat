import { useSocketStore } from '@/stores/useSocketStore'
import { useCallback, useState } from 'react'

/**
 * Hook for handling message pagination and loading
 */
export function useMessagePagination(serverId: string, channelId: string) {
    const [isLoading, setIsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [nextPageState, setNextPageState] = useState<string | undefined>()

    const getPagedMessages = useSocketStore((state) => state.getPagedMessages)

    const loadMessages = useCallback(
        async (limit: number = 50) => {
            if (isLoading || !hasMore) return

            setIsLoading(true)
            try {
                const result = await getPagedMessages(
                    serverId,
                    channelId,
                    limit,
                    nextPageState
                )
                setHasMore(result.hasMore)
                setNextPageState(result.nextPageState)
                return result.messages
            } finally {
                setIsLoading(false)
            }
        },
        [
            serverId,
            channelId,
            nextPageState,
            isLoading,
            hasMore,
            getPagedMessages,
        ]
    )

    const reset = useCallback(() => {
        setIsLoading(false)
        setHasMore(true)
        setNextPageState(undefined)
    }, [])

    return {
        loadMessages,
        reset,
        isLoading,
        hasMore,
    }
}
