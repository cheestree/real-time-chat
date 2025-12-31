import MessageRepository from './MessageRepository'

export function createMessageRepository() {
    if (process.env.NODE_ENV === 'production') {
        return new MessageRepository()
    } else if (process.env.NODE_ENV === 'dev') {
        return new MessageRepository()
    } else {
        return new MessageRepository()
    }
}
