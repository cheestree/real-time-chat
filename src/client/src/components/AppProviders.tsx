'use client'

import { AuthProvider } from '@/components/context/AuthContext'
import { OverlayProvider } from '@/components/context/OverlayContext'
import { SocketProvider } from '@/components/context/SocketContext'
import ThemeProviderWrapper from '@/components/ThemeProviderWrapper'
import { ReactNode } from 'react'
import { useAuth } from './context/AuthContext'
import { ContextMenuContextProvider } from './context/ContextMenuContext'

function AuthenticatedProviders({ children }: { children: ReactNode }) {
    const { isLoggedIn } = useAuth()

    return (
        <ContextMenuContextProvider>
            {isLoggedIn ? (
                <SocketProvider>
                    <OverlayProvider>{children}</OverlayProvider>
                </SocketProvider>
            ) : (
                <OverlayProvider>{children}</OverlayProvider>
            )}
        </ContextMenuContextProvider>
    )
}

export default function AppProviders({ children }: { children: ReactNode }) {
    return (
        <ThemeProviderWrapper>
            <AuthProvider>
                <AuthenticatedProviders>{children}</AuthenticatedProviders>
            </AuthProvider>
        </ThemeProviderWrapper>
    )
}
