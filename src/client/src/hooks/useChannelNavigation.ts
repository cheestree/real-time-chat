import { useSocketStore } from '@/stores/useSocketStore'
import { useCallback } from 'react'

/**
 * Hook providing channel-related actions and navigation
 */
export function useChannelNavigation() {
    const currentChannelId = useSocketStore((state) => state.currentChannelId)
    const currentChannel = useSocketStore((state) => state.currentChannel)

    const createChannel = useSocketStore((state) => state.createChannel)
    const deleteChannel = useSocketStore((state) => state.deleteChannel)
    const changeChannel = useSocketStore((state) => state.changeChannel)
    const getPagedChannels = useSocketStore((state) => state.getPagedChannels)

    const navigateToChannel = useCallback(
        async (channelId: string) => {
            await changeChannel(channelId)
        },
        [changeChannel]
    )

    return {
        // State
        currentChannelId,
        currentChannel,

        // Actions
        createChannel,
        deleteChannel,
        changeChannel,
        navigateToChannel,
        getPagedChannels,
    }
}
