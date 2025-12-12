import { UserProfile } from '@/components/domain/UserProfile'
import UserServices from '@/services/UserServices'
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react'

interface AuthContextType {
    login: (username: string, password: string) => Promise<void>
    register: (
        username: string,
        email: string,
        password: string
    ) => Promise<void>
    logout: () => Promise<void>
    checkAuth: () => Promise<void>
    loggedUser: UserProfile | undefined
    isLoggedIn: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const API_URL = '/api'

    const [isLoading, setIsLoading] = useState(true)
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
    const [loggedUser, setLoggedUser] = useState<UserProfile | undefined>(
        undefined
    )
    const userServices = new UserServices(API_URL)

    async function login(username: string, password: string) {
        await userServices.login(username, password).then(async (r) => {
            if (r.ok) {
                const { token, user } = await r.json()
                const userProfile: UserProfile = user
                setLoggedUser(userProfile)
            } else {
                const { message } = await r.json()
                setLoggedUser(undefined)
            }
            setIsLoggedIn(r.ok)
        })
    }

    async function register(username: string, email: string, password: string) {
        await userServices.register(username, email, password).then((r) => {
            setIsLoggedIn(r.ok)
        })
    }

    async function logout() {
        await userServices.logout()
        setIsLoggedIn(false)
        setLoggedUser(undefined)
    }

    async function checkAuth() {
        await userServices.checkAuth().then(async (r) => {
            if (r.ok) {
                const userProfile: UserProfile = await r.json()
                setLoggedUser(userProfile)
            } else {
                setLoggedUser(undefined)
            }
            setIsLoggedIn(r.ok)
        })
    }

    useEffect(() => {
        const fetchAuth = async () => {
            setIsLoading(true)
            await checkAuth()
            setIsLoading(false)
        }

        fetchAuth()
    }, [checkAuth, isLoggedIn])

    return (
        <AuthContext.Provider
            value={{
                login,
                register,
                logout,
                checkAuth,
                loggedUser,
                isLoggedIn,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useSocket must be used within a AuthProvider')
    }
    return context
}
