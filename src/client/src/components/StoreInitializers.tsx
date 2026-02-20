'use client'

import { useSocketEvents } from '@/hooks/useSocketEvents'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSocketStore } from '@/stores/useSocketStore'
import { ReactNode, useEffect } from 'react'

export function SocketInitializer() {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

    // Subscribe to all socket events
    useSocketEvents()

    // Load initial server data when user logs in
    useEffect(() => {
        if (isLoggedIn) {
            useSocketStore.getState().getUserServers()
        }
    }, [isLoggedIn])

    return null
}

export function AuthInitializer() {
    const checkAuth = useAuthStore((state) => state.checkAuth)

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    return null
}

export function StoreInitializers({ children }: { children: ReactNode }) {
    return (
        <>
            <AuthInitializer />
            <SocketInitializer />
            {children}
        </>
    )
}
