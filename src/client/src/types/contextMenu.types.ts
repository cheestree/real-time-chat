import type { Component, MouseEvent } from 'react'

export interface ContextMenuContextType {
    openContextMenu: (
        event: MouseEvent<HTMLDivElement>,
        options: ContextMenuOption[]
    ) => void
    closeContextMenu: () => void
}

export type ContextMenuOption = {
    label: string
    action: (...args: Component[]) => void
    danger?: boolean
}
