import '@/app/globals.css'
import AppProviders from '@/components/AppProviders'
import React from 'react'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <head>
                <title>RealTimeChat</title>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <meta property="og:title" content="RealTimeChat" />
                <meta property="og:description" content="RealTimeChat" />
            </head>
            <body>
                <AppProviders>{children}</AppProviders>
            </body>
        </html>
    )
}
