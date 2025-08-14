import type { ReactNode } from 'react';

import type { Metadata, Viewport } from 'next';
import { Lora } from 'next/font/google';

import { ThemeProvider } from 'next-themes';

import '@/app/globals.css';
import '@/app/globals.css';
import { Toaster } from '@/components/ui/toaster';
import { GOOGLE_ANALYTICS, ROOT_URL } from '@/config/env';
import { cn } from '@/utils';
import { GoogleAnalytics } from '@next/third-parties/google';

import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { WebSite, WithContext } from 'schema-dts';

export const metadata: Metadata = {
    metadataBase: new URL(`${ROOT_URL}`),
    title: 'Adomate Image Text Composer',
    description:
        'A desktop-only, single-page image editing tool built with Next.js and TypeScript that enables users to upload PNG images and overlay them with fully customizable text',
    icons: {
        icon: '/images/favicon.ico',
        shortcut: '/images/favicon-16x16.png',
        apple: '/images/apple-touch-icon.png'
    },
    keywords: ['image-editor', 'text-overlay', 'fabric.js', 'next.js', 'typescript', 'canvas', 'design-tool'],
    twitter: {
        title: 'Adomate Image Text Composer',
        description: `A desktop-only, single-page image editing tool built with Next.js and TypeScript that enables users to upload PNG images and overlay them with fully customizable text.`,
        images: [
            {
                url: '/images/og-image-md.jpg',
                width: '800',
                height: '600'
            },
            {
                url: '/images/og-image-lg.jpg',
                width: 1800,
                height: 1600
            }
        ]
    },
    openGraph: {
        title: 'Adomate Image Text Composer',
        description: `A desktop-only, single-page image editing tool built with Next.js and TypeScript that enables users to upload PNG images and overlay them with fully customizable text.`,
        url: `${ROOT_URL}`,
        siteName: 'Adomate Image Text Composer',
        images: [
            {
                url: '/images/og-image-md.jpg',
                width: '800',
                height: '600'
            },
            {
                url: '/images/og-image-lg.jpg',
                width: 1800,
                height: 1600
            }
        ],
        locale: 'en_US',
        type: 'website'
    }
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#121212' }
    ]
};

const lora = Lora({
    weight: '400',
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-serif'
});

const schemaData: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Adomate Image Text Composer',
    url: ROOT_URL,
    description:
        'A desktop-only, single-page image editing tool built with Next.js and TypeScript that enables users to upload PNG images and overlay them with fully customizable text.',
    publisher: {
        '@type': 'Organization',
        name: 'Adomate Image Text Composer',
        logo: `${ROOT_URL}/images/nbl-logo.png`
    },
    image: [`${ROOT_URL}/images/og-image-md.jpg`, `${ROOT_URL}/images/og-image-lg.jpg`],
    inLanguage: 'en'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang='en' suppressHydrationWarning>
            <head>
                <script
                    type='application/ld+json'
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(schemaData)
                    }}
                />
            </head>
            <body
                className={cn(
                    `${GeistSans.variable} ${GeistMono.variable} ${lora.variable} font-sans`,
                    'overscroll-none whitespace-pre-line antialiased'
                )}
                suppressHydrationWarning>
                <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
                    {children}
                    <Toaster />
                </ThemeProvider>
                <GoogleAnalytics gaId={`${GOOGLE_ANALYTICS}`} />
            </body>
        </html>
    );
}
