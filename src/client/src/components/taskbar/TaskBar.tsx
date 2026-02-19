'use client'

import Description from '@/components/description/Description'
import UserBar from '@/components/user/UserBar'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSocketStore } from '@/stores/useSocketStore'
import { useState } from 'react'

import Channels from '@/components/channel/Channels'
import ThemeSwitch from '@/components/context/ThemeSwitchContext'
import DirectMessages from '@/components/directMessages/DirectMessages'
import { FaUserFriends } from 'react-icons/fa'
import { FaMessage, FaPeopleGroup } from 'react-icons/fa6'
import Friends from '../friends/Friends'
import styles from './taskbar.module.css'

enum ViewMode {
    SERVERS = 'servers',
    DMS = 'dms',
    FRIENDS = 'friends',
}

export default function TaskBar() {
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SERVERS)

    const currentServer = useSocketStore((state) => state.currentServer)
    const conversations = useSocketStore((state) => state.conversations)
    const changeChannel = useSocketStore((state) => state.changeChannel)
    const changeConversation = useSocketStore(
        (state) => state.changeConversation
    )
    const switchToServerMode = useSocketStore(
        (state) => state.switchToServerMode
    )
    const loggedUser = useAuthStore((state) => state.loggedUser)
    const logout = useAuthStore((state) => state.logout)

    return (
        <div className={styles.container}>
            <div className={styles.modeToggle}>
                <button
                    className={
                        viewMode === ViewMode.SERVERS ? styles.active : ''
                    }
                    onClick={() => {
                        setViewMode(ViewMode.SERVERS)
                        switchToServerMode()
                    }}
                    title="Servers"
                >
                    <FaPeopleGroup />
                </button>
                <button
                    className={viewMode === ViewMode.DMS ? styles.active : ''}
                    onClick={() => {
                        setViewMode(ViewMode.DMS)
                    }}
                    title="Direct Messages"
                >
                    <FaMessage />
                </button>
                <button
                    className={
                        viewMode === ViewMode.FRIENDS ? styles.active : ''
                    }
                    onClick={() => {
                        setViewMode(ViewMode.FRIENDS)
                    }}
                    title="Friends"
                >
                    <FaUserFriends />
                </button>
            </div>

            {viewMode === ViewMode.SERVERS && currentServer && (
                <>
                    <Description
                        name={currentServer.name}
                        description={currentServer.description}
                    />
                    <Channels
                        currentServer={currentServer}
                        onChangeChannel={changeChannel}
                    />
                </>
            )}

            {viewMode === ViewMode.DMS && (
                <>
                    <div className={styles.dmHeader}>
                        <h3>Direct Messages</h3>
                        <p className={styles.dmHint}>
                            Click on a server member to start a DM
                        </p>
                    </div>
                    <DirectMessages
                        conversations={conversations}
                        onChangeConversation={changeConversation}
                    />
                </>
            )}

            {viewMode === ViewMode.FRIENDS && (
                <>
                    <div className={styles.dmHeader}>
                        <h3>Friends</h3>
                        <p className={styles.dmHint}>
                            Friend functionality coming soon!
                        </p>
                    </div>
                    <Friends />
                </>
            )}

            <ThemeSwitch />
            {loggedUser && <UserBar user={loggedUser} logout={logout} />}
        </div>
    )
}
