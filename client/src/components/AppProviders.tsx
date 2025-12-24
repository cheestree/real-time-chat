'use client'

import { AuthProvider } from '@/components/context/AuthContext'
import { OverlayProvider } from '@/components/context/overlay/OverlayContext'
import { SocketProvider } from '@/components/context/SocketContext'
import ThemeProviderWrapper from '@/components/ThemeProviderWrapper'
import { ContextMenuContextProvider } from './context/ContextMenuContext'

export default function AppProviders({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ThemeProviderWrapper>
            <AuthProvider>
                <SocketProvider>
                    <ContextMenuContextProvider>
                        <OverlayProvider>{children}</OverlayProvider>
                    </ContextMenuContextProvider>
                </SocketProvider>
            </AuthProvider>
        </ThemeProviderWrapper>
    )
}
