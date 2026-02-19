import { Fragment, JSX, memo } from 'react'
import styles from './message.module.css'

type MessageProps = {
    id: string
    authorUsername: string
    authorIcon?: string | undefined
    content: string
    timestamp: string
}

function Message({
    id,
    authorUsername,
    authorIcon,
    content,
    timestamp,
}: MessageProps) {
    const extractURLs = (str: string) => {
        const urlRegex = /(https?:\/\/\S+)/g
        const parts = str.split(urlRegex)
        const result: JSX.Element[] = []
        for (let i = 0; i < parts.length; i++) {
            result.push(<span key={`part-${i}`}>{parts[i]}</span>)
            if (i < parts.length - 1) {
                const nextPart = parts[i + 1]
                const url = nextPart ? nextPart.match(urlRegex) : null
                if (url && url.length > 0) {
                    result.push(
                        <a
                            key={`url-${i}`}
                            href={url[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {url[0]}
                        </a>
                    )
                    i++
                }
            }
        }
        return result
    }

    return (
        <div className={styles.container} key={`${id}-${timestamp}`}>
            {authorIcon ? (
                <img src={authorIcon} alt="" className={styles.avatar} />
            ) : (
                <div className={styles.defaultAvatar}>
                    {authorUsername.charAt(0).toUpperCase()}
                </div>
            )}
            <div className={styles.messageContent}>
                <div className={styles.messageHeader}>
                    <strong className={styles.username}>
                        {authorUsername}
                    </strong>
                    <span className={styles.timestamp}>
                        {new Date(timestamp).toLocaleTimeString()}
                    </span>
                </div>
                <div className={styles.messageBody}>
                    {extractURLs(content).map((element, i) => (
                        <Fragment key={i}>{element}</Fragment>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default memo(Message)
