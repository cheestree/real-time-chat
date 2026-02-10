import dotenv from 'dotenv'

// Load environment variables
// Priority: 1) Explicit dotenv_config_path, 2) .env file, 3) .env.demo (fallback)
if (!process.env.DOTENV_CONFIG_PROCESSED) {
    const result = dotenv.config()

    // If no .env found and no explicit config, try .env.demo as fallback
    if (result.error && !process.env.npm_config_dotenv_config_path) {
        console.log('ℹNo .env file found, attempting to load .env.demo...')
        const demoResult = dotenv.config({ path: '.env.demo' })
        if (!demoResult.error) {
            console.log('Using .env.demo for configuration')
        }
    }

    process.env.DOTENV_CONFIG_PROCESSED = 'true'
}
