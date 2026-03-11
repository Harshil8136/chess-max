import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
});

const nextConfig: NextConfig = {
    // Next.js 16 Turbopack bundler (required for turbo builds)
    turbopack: {},

    // Strip console.log in production builds
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },

    // Performance: enable gzip/brotli compression for static assets
    compress: true,

    // Strict React mode catches bugs early
    reactStrictMode: true,

    // Image optimization (disable if you only use <img> tags, not next/image)
    images: {
        unoptimized: true,
    },

    // Production headers for security & caching
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    // Prevent clickjacking
                    { key: 'X-Frame-Options', value: 'DENY' },
                    // Prevent MIME-type sniffing
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    // Control referrer info
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                ],
            },
            {
                // Cache static assets aggressively (pieces, sounds, stockfish WASM)
                source: '/:path*.(png|jpg|svg|mp3|wasm|nnue)',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
        ];
    },

    // Node.js polyfill fallbacks for chess engine WASM
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            path: false,
        };
        return config;
    },
};

export default withPWA(nextConfig);
