/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, // Change to false in development to avoid useEffect double calls, however in general it's good to keep it true
    typescript: {
        ignoreBuildErrors: true,
    },
    compiler: {
        styledComponents: true,
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/app',
                permanent: true,
            },
        ]
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:4000/api/:path*',
            },
        ]
    },
}

export default nextConfig
