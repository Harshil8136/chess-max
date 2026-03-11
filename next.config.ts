import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            path: false,
        };
        return config;
    },
    turbopack: {},
    output: 'export',
    // GitHub Pages and other static hosts don't support dynamic Next.js headers.
    // Since we use the single-threaded Stockfish WASM, we don't need COOP/COEP headers anyway.

    // NOTE: If deploying to a GitHub Pages repository (e.g., username.github.io/chess-max), 
    // uncomment the line below and replace 'chess-max' with your repository name.
    // basePath: '/chess-max',
};

export default withPWA(nextConfig);
