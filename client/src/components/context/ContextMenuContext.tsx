'use client'

import { Menu, MenuItem } from '@mui/material'
import { ContextMenuContextType, ContextMenuOption } from '@/types/contextMenu.types'
import React, {
    createContext,
    ReactNode,
    useContext,
    useState,
} from 'react'

// Re-export for backward compatibility
export type { ContextMenuOption }

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(
    undefined
)

export function ContextMenuContextProvider({
    children,
}: {
    children: ReactNode
}) {
    const [contextMenuOpen, setContextMenuOpen] = useState(false)
    const [contextMenuPosition, setContextMenuPosition] = useState({
        x: 0,
        y: 0,
    })
    const [contextMenuOptions, setContextMenuOptions] = useState<
        ContextMenuOption[]
    >([])

    const openContextMenu = (
        event: React.MouseEvent<HTMLDivElement>,
        options: ContextMenuOption[]
    ) => {
        event.preventDefault()
        setContextMenuOptions(options)
        setContextMenuPosition({ x: event.clientX, y: event.clientY })
        setContextMenuOpen(true)
    }

    const closeContextMenu = () => {
        setContextMenuOptions([])
        setContextMenuOpen(false)
    }

    const handleOptionClick = (action: () => void) => {
        action()
        closeContextMenu()
    }

    return (
        <ContextMenuContext.Provider
            value={{
                openContextMenu,
                closeContextMenu,
            }}
        >
            <Menu
                open={contextMenuOpen}
                onClose={closeContextMenu}
                anchorReference="anchorPosition"
                anchorPosition={{
                    top: contextMenuPosition.y,
                    left: contextMenuPosition.x,
                }}
            >
                {contextMenuOptions &&
                    contextMenuOptions.map((option, index) => (
                        <MenuItem
                            key={index}
                            onClick={() => handleOptionClick(option.action)}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
            </Menu>
            {children}
        </ContextMenuContext.Provider>
    )
}

export function useContextMenu() {
    const context = useContext(ContextMenuContext)
    if (context === undefined) {
        throw new Error(
            'useContextMenu must be used within a ContextMenuProvider'
        )
    }
    return context
}
