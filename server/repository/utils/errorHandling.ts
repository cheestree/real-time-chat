import { logger } from '../../utils/logger'

export async function withErrorHandling<T>(
    operation: () => Promise<T>,
    errorMessage: string
): Promise<T | undefined> {
    try {
        return await operation()
    } catch (error) {
        logger.error({ error }, errorMessage)
        return undefined
    }
}

export async function withErrorHandlingBoolean(
    operation: () => Promise<boolean>,
    errorMessage: string
): Promise<boolean> {
    try {
        return await operation()
    } catch (error) {
        logger.error({ error }, errorMessage)
        return false
    }
}
