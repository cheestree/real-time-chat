import { userService } from '@/services/UserService'
import { AuthenticatedUser } from '@rtchat/shared'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AuthState {
    isLoading: boolean
    isLoggedIn: boolean
    loggedUser: AuthenticatedUser | undefined
    error: string | null

    login: (
        username: string,
        password: string
    ) => Promise<{ success: boolean; message?: string }>
    register: (
        username: string,
        email: string,
        password: string
    ) => Promise<{ success: boolean; message?: string }>
    logout: () => Promise<void>
    checkAuth: () => Promise<void>
    setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set) => ({
                isLoading: false,
                isLoggedIn: false,
                loggedUser: undefined,
                error: null,

                login: async (username, password) => {
                    set({ error: null, isLoading: true })

                    try {
                        const r = await userService.login({
                            username,
                            password,
                        })
                        if (r.success) {
                            set({
                                loggedUser: r.data.user,
                                isLoggedIn: true,
                                isLoading: false,
                            })
                            return { success: true }
                        } else {
                            const errorMsg =
                                r.message || r.error || 'Login failed'
                            set({
                                loggedUser: undefined,
                                isLoggedIn: false,
                                error: errorMsg,
                                isLoading: false,
                            })
                            return { success: false, message: errorMsg }
                        }
                    } catch (e) {
                        const errorMsg = (e as Error)?.message || 'Login error'
                        set({ error: errorMsg, isLoading: false })
                        return { success: false, message: errorMsg }
                    }
                },

                register: async (username, email, password) => {
                    set({ error: null, isLoading: true })

                    try {
                        const r = await userService.register({
                            username,
                            email,
                            password,
                        })
                        if (r.success) {
                            set({
                                loggedUser: r.data.user,
                                isLoggedIn: true,
                                isLoading: false,
                            })
                            return { success: true }
                        } else {
                            const errorMsg =
                                r.message || r.error || 'Registration failed'
                            set({ error: errorMsg, isLoading: false })
                            return { success: false, message: errorMsg }
                        }
                    } catch (e) {
                        const errorMsg =
                            (e as Error)?.message || 'Registration error'
                        set({ error: errorMsg, isLoading: false })
                        return { success: false, message: errorMsg }
                    }
                },

                logout: async () => {
                    set({ isLoading: true })
                    try {
                        await userService.logout()
                        set({
                            loggedUser: undefined,
                            isLoggedIn: false,
                            error: null,
                            isLoading: false,
                        })
                    } catch {
                        set({ isLoading: false })
                    }
                },

                checkAuth: async () => {
                    set({ isLoading: true })
                    try {
                        const r = await userService.checkAuth()
                        if (r && r.authenticated) {
                            set({
                                loggedUser: r.user,
                                isLoggedIn: true,
                                isLoading: false,
                            })
                        } else {
                            set({
                                loggedUser: undefined,
                                isLoggedIn: false,
                                isLoading: false,
                            })
                        }
                    } catch (e) {
                        set({
                            loggedUser: undefined,
                            isLoggedIn: false,
                            error: (e as Error)?.message || 'Auth check error',
                            isLoading: false,
                        })
                    }
                },

                setError: (error) => set({ error }),
            }),
            {
                name: 'auth-storage',
                partialize: (state) => ({
                    isLoggedIn: state.isLoggedIn,
                    loggedUser: state.loggedUser,
                }),
            }
        ),
        { name: 'AuthStore' }
    )
)

// Convenience selectors
export const useUser = () => useAuthStore((state) => state.loggedUser)
export const useIsLoggedIn = () => useAuthStore((state) => state.isLoggedIn)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)
