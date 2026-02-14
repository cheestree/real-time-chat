'use client'

import ChatArea from '@/components/chat/ChatArea'
import Servers from '@/components/servers/Servers'
import TaskBar from '@/components/taskbar/TaskBar'
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'
import styles from './page.module.css'

function AuthGuard({ children }: { children: ReactNode }) {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
    const isLoading = useAuthStore((state) => state.isLoading)
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            router.replace('/login')
        }
    }, [isLoggedIn, isLoading, router])

    if (isLoading) {
        return <div>Loading...</div>
    }
    if (!isLoggedIn) {
        return null
    }
    return <>{children}</>
}

export default function App() {
    return (
        <div className={styles.container}>
            <AuthGuard>
                <Servers />
                <TaskBar />
                <ChatArea />
            </AuthGuard>
        </div>
    )
}
