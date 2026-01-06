export function parseCookies(
    cookieString: string | undefined
): Record<string, string> {
    if (!cookieString) {
        return {}
    }

    const cookies: Record<string, string> = {}
    const cookieArray = cookieString.split(';')

    for (const cookie of cookieArray) {
        const [name, value] = cookie.trim().split('=')
        if (name && value) {
            cookies[name] = value
        }
    }

    return cookies
}

export function getCookie(
    cookieString: string | undefined,
    name: string
): string | undefined {
    const cookies = parseCookies(cookieString)
    return cookies[name]
}
