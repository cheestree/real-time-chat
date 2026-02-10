export function envCheck(): void {
    const profile = process.env.SERVER_PROFILE
    const demo = process.env.DEMO_MODE === 'true'
    const jwt = process.env.JWT_SECRET

    const allowedProfiles = ['dev', 'prod']
    if (!profile || !allowedProfiles.includes(profile)) {
        throw new Error(
            `Invalid SERVER_PROFILE. Expected one of: ${allowedProfiles.join(', ')}`
        )
    }

    if (profile === 'prod' && demo) {
        throw new Error('DEMO_MODE cannot be enabled in production')
    }

    if (demo && profile !== 'dev') {
        throw new Error('DEMO_MODE requires SERVER_PROFILE=dev')
    }

    if (!jwt) {
        throw new Error('JWT_SECRET is required')
    }

    if (profile === 'prod' && jwt === 'dev_only_insecure_secret') {
        throw new Error('Insecure JWT_SECRET used in production')
    }

    const requiredEnvVars = [
        'CORS_ORIGIN',
        'SERVER_HOST',
        'SERVER_PORT',
        'MONGODB_URI',
        'POSTGRES_HOST',
        'POSTGRES_PORT',
        'POSTGRES_DB',
        'POSTGRES_USER',
        'POSTGRES_PASSWORD',
        'REDIS_HOST',
        'REDIS_PORT',
        'REDIS_PASSWORD',
    ]

    const missingVars = requiredEnvVars.filter((key) => !process.env[key])
    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}`
        )
    }

    if (profile === 'dev' && !demo) {
        throw new Error(
            'SERVER_PROFILE=dev requires DEMO_MODE=true in this repository'
        )
    }
}
