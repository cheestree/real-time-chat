import { ReactElement } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface OverlayState {
    isVisible: boolean
    modal: ReactElement | null

    show: (modal: ReactElement) => void
    close: () => void
}

export const useOverlayStore = create<OverlayState>()(
    devtools(
        (set) => ({
            isVisible: false,
            modal: null,

            show: (modal) => set({ isVisible: true, modal }),
            close: () => set({ isVisible: false, modal: null }),
        }),
        { name: 'OverlayStore' }
    )
)

// Convenience selectors
export const useOverlayIsVisible = () =>
    useOverlayStore((state) => state.isVisible)
export const useOverlayModal = () => useOverlayStore((state) => state.modal)
