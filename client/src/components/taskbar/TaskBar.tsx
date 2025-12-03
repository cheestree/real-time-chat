import { useAuth } from '@/components/context/AuthContext'
import { useSocket } from '@/components/context/SocketContext'
import ServerChannels from '@/components/servers/serverchannels/ServerChannels'
import ServerDescription from '@/components/taskbar/server/ServerDescription'
import UserBar from '@/components/user/UserBar'

import ThemeSwitch from '@/components/context/ThemeSwitchContext'
import styles from './taskbar.module.css'

export default function TaskBar() {
    const { servers, currentServer, currentChannel, changeChannel } =
        useSocket()
    const { loggedUser } = useAuth()

    return (
        <div className={styles.taskbar}>
            {servers[currentServer] && (
                <ServerDescription server={servers[currentServer]} />
            )}
            <ServerChannels
                currentServer={currentServer}
                currentChannel={currentChannel}
                changeChannel={changeChannel}
                servers={servers}
            />
            <ThemeSwitch />
            {loggedUser && <UserBar user={loggedUser} />}
        </div>
    )
}
