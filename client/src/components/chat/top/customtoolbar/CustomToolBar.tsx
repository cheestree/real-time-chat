import { Person2 } from '@mui/icons-material'

import styles from './customtoolbar.module.css'

export default function CustomToolBar({
    showMembersToggle,
}: {
    showMembersToggle: () => void
}) {
    return (
        <div className={styles.customtoolbar}>
            <button onClick={() => showMembersToggle()}>
                <Person2 />
            </button>
        </div>
    )
}
