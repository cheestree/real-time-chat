'use client'

import { UserProfile } from '@/domain/UserProfile'
import UserServices from '@/services/UserServices'
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react'

interface AuthActionResult {
    success: boolean
    message?: string
}

interface AuthContextType {
    login: (username: string, password: string) => Promise<AuthActionResult>
    register: (
        username: string,
        email: string,
        password: string
    ) => Promise<AuthActionResult>
    logout: () => Promise<void>
    checkAuth: () => Promise<void>
    loggedUser: UserProfile | undefined
    isLoggedIn: boolean
    isLoading: boolean
    error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(true)
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
    const [loggedUser, setLoggedUser] = useState<UserProfile | undefined>(
        undefined
    )
    const [error, setError] = useState<string | null>(null)
    const userServices = new UserServices()

    async function login(
        username: string,
        password: string
    ): Promise<AuthActionResult> {
        setIsLoading(true)
        setError(null)
        try {
            const r = await userServices.login(username, password)
            if (r.ok) {
                const { token, user } = await r.json()
                setLoggedUser(user)
                setIsLoggedIn(true)
                setIsLoading(false)
                return { success: true }
            } else {
                const { message } = await r.json()
                setLoggedUser(undefined)
                setIsLoggedIn(false)
                setError(message || 'Login failed')
                setIsLoading(false)
                return { success: false, message }
            }
        } catch (e: unknown) {
            const err = e as Error
            setError(err?.message || 'Login error')
            setIsLoading(false)
            return { success: false, message: err?.message }
        }
    }

    async function register(
        username: string,
        email: string,
        password: string
    ): Promise<AuthActionResult> {
        setIsLoading(true)
        setError(null)
        try {
            const r = await userServices.register(username, email, password)
            setIsLoggedIn(r.ok)
            setIsLoading(false)
            if (r.ok) {
                return { success: true }
            } else {
                const { message } = await r.json()
                setError(message || 'Registration failed')
                return { success: false, message }
            }
        } catch (e: unknown) {
            const err = e as Error
            setError(err?.message || 'Registration error')
            setIsLoading(false)
            return { success: false, message: err?.message }
        }
    }

    async function logout() {
        setIsLoading(true)
        setError(null)
        await userServices.logout()
        setIsLoggedIn(false)
        setLoggedUser(undefined)
        setIsLoading(false)
    }

    async function checkAuth() {
        setIsLoading(true)
        setError(null)
        try {
            const r = await userServices.checkAuth()
            if (r.ok) {
                const userProfile: UserProfile = await r.json()
                setLoggedUser(userProfile)
                setIsLoggedIn(true)
            } else {
                setLoggedUser(undefined)
                setIsLoggedIn(false)
            }
        } catch (e: unknown) {
            const err = e as Error
            setError(err?.message || 'Auth check error')
        }
        setIsLoading(false)
    }

    useEffect(() => {
        checkAuth()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const contextValue = {
        login,
        register,
        logout,
        checkAuth,
        loggedUser,
        isLoggedIn,
        isLoading,
        error,
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
