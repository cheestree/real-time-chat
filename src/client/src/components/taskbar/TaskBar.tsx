'use client'

import { useAuth } from '@/components/context/AuthContext'
import { useSocket } from '@/components/context/SocketContext'
import Description from '@/components/description/Description'
import UserBar from '@/components/user/UserBar'

import Channels from '@/components/channel/Channels'
import ThemeSwitch from '@/components/context/ThemeSwitchContext'
import styles from './taskbar.module.css'

export default function TaskBar() {
    const { currentServer, changeChannel } = useSocket()
    const { loggedUser, logout } = useAuth()

    return (
        <div className={styles.container}>
            {currentServer && (
                <Description
                    name={currentServer.name}
                    description={currentServer.description}
                />
            )}
            {currentServer && (
                <Channels
                    currentServer={currentServer}
                    onChangeChannel={changeChannel}
                />
            )}
            <ThemeSwitch />
            {loggedUser && <UserBar user={loggedUser} logout={logout} />}
        </div>
    )
}
