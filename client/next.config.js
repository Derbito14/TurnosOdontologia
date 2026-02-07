/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
        '@fullcalendar/common',
        '@fullcalendar/core',
        '@fullcalendar/daygrid',
        '@fullcalendar/interaction',
        '@fullcalendar/react',
        '@fullcalendar/timegrid',
    ],
}

module.exports = nextConfig
