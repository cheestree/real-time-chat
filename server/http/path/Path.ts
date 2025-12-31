const Path = {
    ROOT: '/',
    API: '/api',
    USERS: {
        ROOT: '/users',
        LOGIN: '/login',
        REGISTER: '/register',
        LOGOUT: '/logout',
        PROFILE: '/profile',
        AUTH: '/auth',
        INIT: '/init',
    },
    SERVERS: '/servers',
} as const

export { Path }
