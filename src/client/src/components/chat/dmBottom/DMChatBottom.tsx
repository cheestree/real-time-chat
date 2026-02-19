'use client'

import Message from '@/components/chat/shared/Message'
import { Conversation, DirectMessage } from '@/domain/DirectMessage'
import { useSocketStore } from '@/stores/useSocketStore'
import { useCallback, useState } from 'react'
import styles from '../bottom/bottom.module.css'

type DMChatBottomProps = {
    conversation: Conversation
}

export default function DMChatBottom({ conversation }: DMChatBottomProps) {
    const messageDM = useSocketStore((state) => state.messageDM)
    const currentRecipientId = useSocketStore(
        (state) => state.currentRecipientId
    )
    const [chatMessage, setChatMessage] = useState<string>('')

    const handleKeyDown = useCallback(
        (event: { key: string }) => {
            if (
                event.key === 'Enter' &&
                chatMessage !== '' &&
                currentRecipientId
            ) {
                messageDM(currentRecipientId, chatMessage)
                setChatMessage('')
            }
        },
        [chatMessage, messageDM, currentRecipientId]
    )

    return (
        <div className={styles.container}>
            <div className={styles.messages}>
                {((conversation && conversation.messages) || []).map(
                    (message: DirectMessage) => (
                        <Message
                            key={message.id}
                            id={message.id}
                            authorUsername={message.authorUsername}
                            authorIcon={message.authorIcon}
                            content={message.content}
                            timestamp={message.timestamp}
                        />
                    )
                )}
            </div>
            <div className={styles.send}>
                <input
                    onChange={(e) => setChatMessage(e.target.value)}
                    value={chatMessage}
                    type="text"
                    placeholder={`Send message to ${conversation.otherUsername}`}
                    onKeyDown={handleKeyDown}
                />
            </div>
        </div>
    )
}
