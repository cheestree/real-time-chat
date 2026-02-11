'use client'

import {
    ContextMenuContextType,
    ContextMenuOption,
} from '@/types/contextMenu.types'
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
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

    const closeContextMenu = useCallback(() => {
        setContextMenuOptions([])
        setContextMenuOpen(false)
    }, [])

    const openContextMenu = useCallback(
        (
            event: React.MouseEvent<HTMLElement>,
            options: ContextMenuOption[]
        ) => {
            event.preventDefault()
            setContextMenuOptions(options)
            setContextMenuPosition({ x: event.clientX, y: event.clientY })
            setContextMenuOpen(true)
        },
        []
    )

    const handleOptionClick = useCallback(
        (action: () => void) => {
            action()
            closeContextMenu()
        },
        [closeContextMenu]
    )

    const contextValue = useMemo(
        () => ({
            openContextMenu,
            closeContextMenu,
        }),
        [openContextMenu, closeContextMenu]
    )

    return (
        <ContextMenuContext.Provider value={contextValue}>
            {contextMenuOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 2000,
                    }}
                    onClick={closeContextMenu}
                >
                    <ul
                        style={{
                            position: 'absolute',
                            top: contextMenuPosition.y,
                            left: contextMenuPosition.x,
                            background: '#222',
                            color: '#fff',
                            borderRadius: 4,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            padding: 0,
                            margin: 0,
                            minWidth: 160,
                            listStyle: 'none',
                            zIndex: 2001,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {contextMenuOptions.map((option, idx) => (
                            <li
                                key={idx}
                                style={{
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    borderBottom:
                                        idx !== contextMenuOptions.length - 1
                                            ? '1px solid #333'
                                            : 'none',
                                }}
                                onClick={() => handleOptionClick(option.action)}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
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
