'use client'

import ThemeProviderWrapper from '@/components/ThemeProviderWrapper'
import { ReactNode } from 'react'
import { LoadingProvider } from './context/LoadingContext'
import { ContextMenuRenderer } from './ContextMenuRenderer'
import { LoadingOverlay } from './loading/LoadingOverlay'
import { OverlayRenderer } from './OverlayRenderer'
import { StoreInitializers } from './StoreInitializers'

export default function AppProviders({ children }: { children: ReactNode }) {
    return (
        <ThemeProviderWrapper>
            <StoreInitializers>
                <LoadingProvider>
                    <LoadingOverlay />
                    <ContextMenuRenderer />
                    <OverlayRenderer />
                    {children}
                </LoadingProvider>
            </StoreInitializers>
        </ThemeProviderWrapper>
    )
}
