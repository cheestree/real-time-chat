import { useSocketStore } from '@/stores/useSocketStore'
import { useCallback } from 'react'

/**
 * Hook for handling direct message operations
 */
export function useDirectMessages() {
    const conversations = useSocketStore((state) => state.conversations)
    const currentRecipientId = useSocketStore(
        (state) => state.currentRecipientId
    )
    const currentConversation = useSocketStore(
        (state) => state.currentConversation
    )

    const messageDM = useSocketStore((state) => state.messageDM)
    const changeConversation = useSocketStore(
        (state) => state.changeConversation
    )
    const switchToServerMode = useSocketStore(
        (state) => state.switchToServerMode
    )
    const getDirectMessages = useSocketStore((state) => state.getDirectMessages)

    const sendDirectMessage = useCallback(
        (recipientId: string, content: string) => {
            messageDM(recipientId, content)
        },
        [messageDM]
    )

    const openConversation = useCallback(
        async (recipientId: string, recipientUsername?: string) => {
            await changeConversation(recipientId, recipientUsername)
        },
        [changeConversation]
    )

    return {
        // State
        conversations,
        currentRecipientId,
        currentConversation,

        // Actions
        sendDirectMessage,
        openConversation,
        switchToServerMode,
        getDirectMessages,
    }
}
