'use client'

import { Conversation } from '@/domain/DirectMessage'
import styles from '../top/top.module.css'

type DMChatTopProps = {
    conversation: Conversation
}

export default function DMChatTop({ conversation }: DMChatTopProps) {
    return (
        <div className={styles.container}>
            <div className={styles.userInfo}>
                <div className={styles.avatar}>
                    {conversation.otherUserIcon ? (
                        <img src={conversation.otherUserIcon} alt="" />
                    ) : (
                        <div className={styles.defaultAvatar}>
                            {conversation.otherUsername.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <h2 className={styles.username}>
                    {conversation.otherUsername}
                </h2>
            </div>
        </div>
    )
}
