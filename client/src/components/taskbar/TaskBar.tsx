'use client'

import { useAuth } from '@/components/context/AuthContext'
import { useSocket } from '@/components/context/SocketContext'
import Description from '@/components/description/Description'
import ServerChannels from '@/components/servers/serverchannels/ServerChannels'
import UserBar from '@/components/user/UserBar'

import ThemeSwitch from '@/components/context/ThemeSwitchContext'
import styles from './taskbar.module.css'

export default function TaskBar() {
    const { currentServer, changeChannel } = useSocket()
    const { loggedUser } = useAuth()

    return (
        <div className={styles.taskbar}>
            {currentServer && (
                <Description
                    name={currentServer.name}
                    description={currentServer.description}
                />
            )}
            {currentServer && (
                <ServerChannels
                    currentServer={currentServer}
                    onChangeChannel={changeChannel}
                />
            )}
            <ThemeSwitch />
            {<UserBar user={loggedUser!} />}
        </div>
    )
}
