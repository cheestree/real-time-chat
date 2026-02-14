'use client'

import Description from '@/components/description/Description'
import UserBar from '@/components/user/UserBar'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSocketStore } from '@/stores/useSocketStore'

import Channels from '@/components/channel/Channels'
import ThemeSwitch from '@/components/context/ThemeSwitchContext'
import styles from './taskbar.module.css'

export default function TaskBar() {
    const currentServer = useSocketStore((state) => state.currentServer)
    const changeChannel = useSocketStore((state) => state.changeChannel)
    const loggedUser = useAuthStore((state) => state.loggedUser)
    const logout = useAuthStore((state) => state.logout)

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
