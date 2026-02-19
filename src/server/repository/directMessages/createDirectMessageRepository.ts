import DirectMessageRepository from './DirectMessageRepository'

export function createDirectMessageRepository(): DirectMessageRepository {
    return new DirectMessageRepository()
}
