'use client'

import { useContextMenuStore } from '@/stores/useContextMenuStore'
import { useEffect, useRef } from 'react'
import styles from './context/contextmenu.module.css'

export function ContextMenuRenderer() {
    const isOpen = useContextMenuStore((state) => state.isOpen)
    const position = useContextMenuStore((state) => state.position)
    const options = useContextMenuStore((state) => state.options)
    const close = useContextMenuStore((state) => state.close)
    const handleOptionClick = useContextMenuStore(
        (state) => state.handleOptionClick
    )

    const menuRef = useRef<HTMLDivElement>(null)

    // Clamp to viewport after mount so menu never clips off-screen
    useEffect(() => {
        if (!isOpen || !menuRef.current) return
        const menu = menuRef.current
        const rect = menu.getBoundingClientRect()
        const vw = window.innerWidth
        const vh = window.innerHeight
        if (rect.right > vw) {
            menu.style.left = `${position.x - rect.width}px`
        }
        if (rect.bottom > vh) {
            menu.style.top = `${position.y - rect.height}px`
        }
    }, [isOpen, position])

    if (!isOpen) return null

    return (
        <>
            <div className={styles.backdrop} onClick={close} />
            <div
                ref={menuRef}
                className={styles.contextMenu}
                style={{ top: position.y, left: position.x }}
            >
                <ul>
                    {options.map((option, index) => (
                        <li
                            key={index}
                            className={
                                option.danger ? styles.danger : undefined
                            }
                            onClick={() => handleOptionClick(option.action)}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    )
}
