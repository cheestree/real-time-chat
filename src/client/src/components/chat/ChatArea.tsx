'use client'

import ChatBottom from '@/components/chat/bottom/ChatBottom'
import ChatTop from '@/components/chat/top/ChatTop'
import { useSocketStore } from '@/stores/useSocketStore'
import { useCallback, useState } from 'react'

import styles from './chat.module.css'

export default function ChatArea() {
    const currentServer = useSocketStore((state) => state.currentServer)
    const currentChannel = useSocketStore((state) => state.currentChannel)
    const [showMembers, setShowMembers] = useState(false)

    const toggleShowMembers = useCallback(() => {
        setShowMembers((prev) => !prev)
    }, [])

    return (
        <div className={styles.container}>
            {currentServer && currentChannel && (
                <ChatTop
                    channel={currentChannel}
                    showMembersToggle={toggleShowMembers}
                />
            )}
            {currentServer && currentChannel && (
                <ChatBottom
                    currentServer={currentServer}
                    currentChannel={currentChannel}
                    isShowMembers={showMembers}
                />
            )}
        </div>
    )
}
