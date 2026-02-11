'use client'

import { useSocket } from '@/components/context/SocketContext'
import Member from '@/components/members/Member'
import { useCallback, useState } from 'react'

import MessageItem from '@/components/chat/bottom/MessageItem'
import { Channel } from '@/domain/Channel'
import { Server } from '@/domain/Server'
import styles from './bottom.module.css'

type ChatBottomProps = {
    currentServer: Server
    currentChannel: Channel
    isShowMembers: boolean
}

export default function ChatBottom({
    currentServer,
    currentChannel,
    isShowMembers,
}: ChatBottomProps) {
    const { messageServer } = useSocket()
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

    return (
        <div
            className={`${styles.container} ${isShowMembers ? styles.showMembers : ''}`}
        >
            <div className={styles.messages}>
                {(currentChannel?.messages || []).map((message) => (
                    <MessageItem key={message.id} message={message} />
                ))}
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
                            />
                        ))}
                </div>
            )}
        </div>
    )
}
