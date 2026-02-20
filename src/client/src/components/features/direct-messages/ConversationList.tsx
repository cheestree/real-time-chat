'use client'

import { Conversation } from '@/domain/DirectMessage'
import { useSocketStore } from '@/stores/useSocketStore'
import ConversationComponent from './conversation/Conversation'
import styles from './directMessages.module.css'

type DirectMessagesProps = {
    conversations: Conversation[]
    onChangeConversation: (userId: string) => void
}

export default function DirectMessages({
    conversations,
    onChangeConversation,
}: DirectMessagesProps) {
    const currentRecipientId = useSocketStore(
        (state) => state.currentRecipientId
    )

    return (
        <div className={styles.container}>
            <div className={styles.conversations}>
                {conversations &&
                    conversations.map((conversation: Conversation) => (
                        <ConversationComponent
                            key={conversation.otherUserId}
                            conversation={conversation}
                            currentlySelected={
                                currentRecipientId === conversation.otherUserId
                            }
                            onChangeConversation={() =>
                                onChangeConversation(conversation.otherUserId)
                            }
                        />
                    ))}
            </div>
        </div>
    )
}
