'use client'

import { User } from '@/domain/User'
import { userServices } from '@/services/UserServices'
import { AuthActionResult, AuthContextType } from '@/types/auth.types'
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
    const [loggedUser, setLoggedUser] = useState<User | undefined>(undefined)
    const [error, setError] = useState<string | null>(null)

    const login = useCallback(
        async (
            username: string,
            password: string
        ): Promise<AuthActionResult> => {
            setError(null)
            setIsLoading(true)

            try {
                const r = await userServices.login(username, password)
                if (r.ok) {
                    const { user } = await r.json()
                    setLoggedUser(user)
                    setIsLoggedIn(true)
                    return { success: true }
                } else {
                    const { message } = await r.json()
                    setLoggedUser(undefined)
                    setIsLoggedIn(false)
                    setError(message || 'Login failed')
                    return { success: false, message }
                }
            } catch (e: unknown) {
                const err = e as Error
                const errorMsg = err?.message || 'Login error'
                setError(errorMsg)
                return { success: false, message: errorMsg }
            } finally {
                setIsLoading(false)
            }
        },
        []
    )

    const register = useCallback(
        async (
            username: string,
            email: string,
            password: string
        ): Promise<AuthActionResult> => {
            setError(null)
            setIsLoading(true)

            try {
                const r = await userServices.register(username, email, password)
                setIsLoggedIn(r.ok)
                if (r.ok) {
                    return { success: true }
                } else {
                    const { message } = await r.json()
                    setError(message || 'Registration failed')
                    return { success: false, message }
                }
            } catch (e: unknown) {
                const err = e as Error
                const errorMsg = err?.message || 'Registration error'
                setError(errorMsg)
                return { success: false, message: errorMsg }
            } finally {
                setIsLoading(false)
            }
        },
        []
    )

    const logout = useCallback(async () => {
        setError(null)
        setIsLoading(true)
        try {
            await userServices.logout()
            setLoggedUser(undefined)
            setIsLoggedIn(false)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const checkAuth = useCallback(async () => {
        setError(null)
        setIsLoading(true)
        try {
            const r = await userServices.checkAuth()
            if (r.ok) {
                const user: User = await r.json()
                setLoggedUser(user)
                setIsLoggedIn(true)
            } else {
                setLoggedUser(undefined)
                setIsLoggedIn(false)
            }
        } catch (e: unknown) {
            const err = e as Error
            setError(err?.message || 'Auth check error')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    const contextValue = useMemo(
        () => ({
            login,
            register,
            logout,
            checkAuth,
            loggedUser,
            isLoggedIn,
            isLoading,
            error,
        }),
        [
            login,
            register,
            logout,
            checkAuth,
            loggedUser,
            isLoggedIn,
            isLoading,
            error,
        ]
    )

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
