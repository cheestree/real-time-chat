'use client'

import styles from './customtoolbar.module.css'

export default function CustomToolBar({
    showMembersToggle,
}: {
    showMembersToggle: () => void
}) {
    return (
        <div className={styles.customtoolbar}>
            <button onClick={() => showMembersToggle()}>Show Members</button>
        </div>
    )
}
