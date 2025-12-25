import UserRepository from './UserRepository'

export function createUserRepository() {
    if (process.env.NODE_ENV === 'production') {
        return new UserRepository()
    } else if (process.env.NODE_ENV === 'dev') {
        return new UserRepository()
    } else {
        return new UserRepository()
    }
}
