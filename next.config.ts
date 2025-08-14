import type { NextConfig } from 'next';

import type { Configuration as WebpackConfiguration } from 'webpack';

/** @type {import('next').NextConfig} */
interface WebpackConfigContext {
    isServer: boolean;
}

const nextConfig: NextConfig = {
    experimental: {
        optimizePackageImports: ['lucide-react', 'fabric']
    },

    output: 'standalone',
    trailingSlash: true,
    images: {
        unoptimized: true
    },

    webpack: (config: WebpackConfiguration, { isServer }: WebpackConfigContext) => {
        if (!isServer) {
            config.resolve = {
                ...config.resolve,
                fallback: {
                    ...config.resolve?.fallback,
                    fs: false,
                    net: false,
                    tls: false
                }
            };
        }

        config.module = config.module || {};
        config.module.rules = config.module.rules || [];
        config.module.rules.push({
            test: /fabric/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['next/babel']
                }
            }
        });

        return config;
    },

    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    }
                ]
            }
        ];
    }
};

module.exports = nextConfig;
