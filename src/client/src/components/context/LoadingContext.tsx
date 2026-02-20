import React, { createContext, useContext, useState } from 'react'

const LoadingContext = createContext({
    loading: false,
    setLoading: (_value: boolean) => {},
})

export const useLoading = () => useContext(LoadingContext)

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [loading, setLoading] = useState(false)
    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            {children}
        </LoadingContext.Provider>
    )
}
