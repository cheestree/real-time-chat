import pino from 'pino'

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    // Use pretty printing in development, JSON in production
    transport:
        process.env.NODE_ENV !== 'production'
            ? {
                  target: 'pino-pretty',
                  options: {
                      colorize: true,
                      translateTime: 'SYS:standard',
                      ignore: 'pid,hostname',
                  },
              }
            : undefined,
})
