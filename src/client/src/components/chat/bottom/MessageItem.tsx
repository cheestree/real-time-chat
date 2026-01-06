import { Message } from '@/domain/Message'
import { Fragment } from 'react'

import styles from './message.module.css'

type MessageItemProps = {
    message: Message
}

export default function MessageItem({ message }: MessageItemProps) {
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
        <div
            className={styles.container}
            key={`${message.id}-${message.timestamp}`}
        >
            <img className={styles.icon} src={message.authorIcon} alt="icon" />
            <div className={styles.messageContent}>
                <div className={styles.messageHeader}>
                    <strong>{message.authorUsername}</strong>
                    <span className={styles.timestamp}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                </div>
                <div className={styles.messageBody}>
                    {extractURLs(message.content).map((element, i) => (
                        <Fragment key={i}>{element}</Fragment>
                    ))}
                </div>
            </div>
        </div>
    )
}
