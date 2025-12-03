'use client'

import Servers from '@/components/servers/Servers'
import TaskBar from '@/components/taskbar/TaskBar'

import ChatArea from '@/components/chat/ChatArea'
import { OverlayProvider } from '@/components/context/OverlayContext'
import { SocketProvider } from '@/components/context/SocketContext'
import styles from './app.module.css'

export default function App() {
    return (
        <div className={styles.app}>
            <SocketProvider>
                <OverlayProvider>
                    <Servers />
                    <TaskBar />
                    <ChatArea />
                </OverlayProvider>
            </SocketProvider>
        </div>
    )
}
