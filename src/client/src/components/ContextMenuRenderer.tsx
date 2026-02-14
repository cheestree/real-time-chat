'use client'

import { useContextMenuStore } from '@/stores/useContextMenuStore'
import styles from './context/contextmenu.module.css'

export function ContextMenuRenderer() {
    const isOpen = useContextMenuStore((state) => state.isOpen)
    const position = useContextMenuStore((state) => state.position)
    const options = useContextMenuStore((state) => state.options)
    const close = useContextMenuStore((state) => state.close)
    const handleOptionClick = useContextMenuStore(
        (state) => state.handleOptionClick
    )

    if (!isOpen) return null

    return (
        <>
            <div className={styles.backdrop} onClick={close} />
            <div
                className={styles.contextMenu}
                style={{ top: position.y, left: position.x }}
            >
                <ul>
                    {options.map((option, index) => (
                        <li
                            key={index}
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
