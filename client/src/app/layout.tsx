import '@/app/globals.css'
import AppProviders from '@/components/AppProviders'
import CustomLayout from '@/components/customlayout/CustomLayout'
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
            </head>
            <body>
                <AppProviders>
                    <CustomLayout>{children}</CustomLayout>
                </AppProviders>
            </body>
        </html>
    )
}
