'use client'

import ChatArea from '@/components/chat/ChatArea'
import { useAuth } from '@/components/context/AuthContext'
import Servers from '@/components/servers/Servers'
import TaskBar from '@/components/taskbar/TaskBar'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import styles from './app.module.css'

function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, isLoading } = useAuth()
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
        <div className={styles.app}>
            <AuthGuard>
                <Servers />
                <TaskBar />
                <ChatArea />
            </AuthGuard>
        </div>
    )
}
