'use client'
import CustomLayout from '@/components/customlayout/CustomLayout'
import React from 'react'

import vt323 from '@/lib/font'
import './globals.css'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <title>RealTimeChat</title>
            </head>
            <body className={vt323.className}>
                <CustomLayout>{children}</CustomLayout>
            </body>
        </html>
    )
}
