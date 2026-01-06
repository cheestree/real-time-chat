import { HttpError } from '../../domain/error/Error'

export function requireOrThrow<T extends HttpError>(
    error: new (message?: string) => T,
    condition: unknown,
    message: string
): asserts condition {
    if (!condition) {
        throw new error(message)
    }
}
