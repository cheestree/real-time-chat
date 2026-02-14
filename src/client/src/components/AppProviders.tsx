'use client'

import ThemeProviderWrapper from '@/components/ThemeProviderWrapper'
import { ReactNode } from 'react'
import { ContextMenuRenderer } from './ContextMenuRenderer'
import { OverlayRenderer } from './OverlayRenderer'
import { StoreInitializers } from './StoreInitializers'

export default function AppProviders({ children }: { children: ReactNode }) {
    return (
        <ThemeProviderWrapper>
            <StoreInitializers>
                <ContextMenuRenderer />
                <OverlayRenderer />
                {children}
            </StoreInitializers>
        </ThemeProviderWrapper>
    )
}
