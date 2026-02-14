import { ContextMenuOption } from '@/types/contextMenu.types'
import { MouseEvent } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface ContextMenuState {
    isOpen: boolean
    position: { x: number; y: number }
    options: ContextMenuOption[]

    open: (event: MouseEvent<HTMLElement>, options: ContextMenuOption[]) => void
    close: () => void
    handleOptionClick: (action: () => void) => void
}

export const useContextMenuStore = create<ContextMenuState>()(
    devtools(
        (set) => ({
            isOpen: false,
            position: { x: 0, y: 0 },
            options: [],

            open: (event, options) => {
                event.preventDefault()
                set({
                    isOpen: true,
                    position: { x: event.clientX, y: event.clientY },
                    options,
                })
            },

            close: () => {
                set({ isOpen: false, options: [] })
            },

            handleOptionClick: (action) => {
                action()
                set({ isOpen: false, options: [] })
            },
        }),
        { name: 'ContextMenuStore' }
    )
)

// Convenience selectors
export const useContextMenuIsOpen = () =>
    useContextMenuStore((state) => state.isOpen)
export const useContextMenuPosition = () =>
    useContextMenuStore((state) => state.position)
export const useContextMenuOptions = () =>
    useContextMenuStore((state) => state.options)
