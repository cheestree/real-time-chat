import { AuthProvider } from '@/components/context/AuthContext'
import { ContextMenuContextProvider } from '@/components/context/ContextMenuContext'
import { ThemeProvider } from 'next-themes'
import { ReactNode } from 'react'

export default function CustomLayout({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <ContextMenuContextProvider>
                <AuthProvider>{children}</AuthProvider>
            </ContextMenuContextProvider>
        </ThemeProvider>
    )
}
