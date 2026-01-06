import ServerRepository from './ServerRepository'

export function createServerRepository() {
    if (process.env.NODE_ENV === 'production') {
        return new ServerRepository()
    } else if (process.env.NODE_ENV === 'dev') {
        return new ServerRepository()
    } else {
        return new ServerRepository()
    }
}
