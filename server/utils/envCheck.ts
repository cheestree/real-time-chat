export function envCheck(): void {
    const requiredEnvVars = [
        'JWT_SECRET',
        'CORS_ORIGIN',
        'SERVER_HOST',
        'SERVER_PORT',
        'SERVER_PROFILE',
        'POSTGRES_HOST',
        'POSTGRES_PORT',
        'POSTGRES_DB',
        'POSTGRES_USER',
        'POSTGRES_PASSWORD',
        'MONGODB_USER',
        'MONGODB_PASSWORD',
        'MONGODB_DB',
        'MONGODB_URI',
        'REDIS_HOST',
        'REDIS_PORT',
        'REDIS_PASSWORD',
        'CASSANDRA_HOST',
        'CASSANDRA_PORT',
    ]

    const missingVars = requiredEnvVars.filter((key) => !process.env[key])
    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}`
        )
    }
}
