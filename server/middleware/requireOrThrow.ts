import { HttpError } from '../domain/error/Error'

export function requireOrThrow<T extends HttpError>(
    error: new (message?: string) => T,
    method: boolean,
    message: string
) {
    if (!method) {
        throw new error(message)
    }
}
