'use client'

import styles from './description.module.css'

type DescriptionProps = {
    name: string
    description: string
}

export default function Description({ name, description }: DescriptionProps) {
    return (
        <div className={styles.container}>
            <div className={styles.name}>
                <h3>{name}</h3>
            </div>
            <div className={styles.description}>
                <h4>{description}</h4>
            </div>
        </div>
    )
}
