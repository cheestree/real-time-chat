'use client'

import ChatBottom from '@/components/chat/bottom/ChatBottom'
import ChatTop from '@/components/chat/top/ChatTop'
import { useSocket } from '@/components/context/SocketContext'
import { useState } from 'react'

import styles from './chat.module.css'

export default function ChatArea() {
    const { servers, currentServer, currentChannel } = useSocket()
    const [showMembers, setShowMembers] = useState(false)

    return (
        <div className={styles.mainWindow}>
            {servers[currentServer] && servers[currentServer].channels[currentChannel] && (
                <ChatTop
                    channel={servers[currentServer].channels[currentChannel]!}
                    showMembersToggle={() => setShowMembers(!showMembers)}
                />
            )}
            {servers[currentServer] && servers[currentServer].channels[currentChannel] && (
                <ChatBottom
                    currentServer={servers[currentServer]}
                    currentChannel={currentChannel}
                    isShowMembers={showMembers}
                />
            )}
        </div>
    )
}
