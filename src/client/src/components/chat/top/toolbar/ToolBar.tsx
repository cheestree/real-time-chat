'use client'

import styles from './toolbar.module.css'

type ToolBarProps = {
    showMembersToggle: () => void
}

export default function ToolBar({ showMembersToggle }: ToolBarProps) {
    return (
        <div className={styles.toolbar}>
            <button onClick={showMembersToggle}>Show Members</button>
        </div>
    )
}
