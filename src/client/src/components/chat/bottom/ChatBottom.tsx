'use client'

import Member from '@/components/members/Member'
import { useSocketStore } from '@/stores/useSocketStore'
import { useCallback, useState } from 'react'

import Message from '@/components/chat/shared/Message'
import { ChannelDetail, ServerDetail } from '@rtchat/shared'
import styles from './bottom.module.css'

type ChatBottomProps = {
    currentServer: ServerDetail
    currentChannel: ChannelDetail
    isShowMembers: boolean
}

export default function ChatBottom({
    currentServer,
    currentChannel,
    isShowMembers,
}: ChatBottomProps) {
    const messageServer = useSocketStore((state) => state.messageServer)
    const changeConversation = useSocketStore(
        (state) => state.changeConversation
    )
    const [chatMessage, setChatMessage] = useState<string>('')

    const handleKeyDown = useCallback(
        (event: { key: string }) => {
            if (event.key === 'Enter' && chatMessage !== '') {
                messageServer(chatMessage)
                setChatMessage('')
            }
        },
        [chatMessage, messageServer]
    )

    const handleMemberClick = useCallback(
        (userId: string, username: string) => {
            changeConversation(userId, username)
        },
        [changeConversation]
    )

    return (
        <div
            className={`${styles.container} ${isShowMembers ? styles.showMembers : ''}`}
        >
            <div className={styles.messages}>
                {((currentChannel && currentChannel.messages) || []).map(
                    (message) => (
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
            {currentChannel && (
                <div className={styles.send}>
                    <input
                        onChange={(e) => setChatMessage(e.target.value)}
                        value={chatMessage}
                        type="text"
                        placeholder={'Send message to ' + currentChannel.name}
                        onKeyDown={handleKeyDown}
                    />
                </div>
            )}
            {isShowMembers && (
                <div className={styles.members}>
                    {currentServer &&
                        currentServer.users &&
                        currentServer.users.map((user) => (
                            <Member
                                key={user.id}
                                id={user.id}
                                name={user.username}
                                icon={''}
                                status={true}
                                onClickMember={handleMemberClick}
                            />
                        ))}
                </div>
            )}
        </div>
    )
}
