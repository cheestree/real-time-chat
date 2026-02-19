'use client'

import { Conversation } from '@/domain/DirectMessage'
import styles from './conversation.module.css'

type ConversationProps = {
    conversation: Conversation
    currentlySelected: boolean
    onChangeConversation: () => void
}

export default function ConversationComponent({
    conversation,
    currentlySelected,
    onChangeConversation,
}: ConversationProps) {
    return (
        <div
            className={`${styles.conversation} ${currentlySelected ? styles.selected : ''}`}
            onClick={onChangeConversation}
        >
            <div className={styles.avatar}>
                {conversation.otherUserIcon ? (
                    <img src={conversation.otherUserIcon} alt="" />
                ) : (
                    <div className={styles.defaultAvatar}>
                        {conversation.otherUsername.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            <div className={styles.info}>
                <div className={styles.username}>
                    {conversation.otherUsername}
                </div>
                {conversation.lastMessage && (
                    <div className={styles.lastMessage}>
                        {conversation.lastMessage.content}
                    </div>
                )}
            </div>
            {conversation.unreadCount && conversation.unreadCount > 0 && (
                <div className={styles.unreadBadge}>
                    {conversation.unreadCount}
                </div>
            )}
        </div>
    )
}
