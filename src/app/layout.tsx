import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-plus-jakarta',
});

export const viewport: Viewport = {
    themeColor: '#121212',
};

export const metadata: Metadata = {
    title: 'Chess Max — Play Chess vs Computer',
    description:
        'Play chess against the computer at any skill level. Challenge AI opponents from Beginner (ELO 400) to Grandmaster (ELO 2000). Free, fast, and beautiful.',
    keywords: ['chess', 'play chess', 'chess game', 'vs computer', 'stockfish', 'chess online'],
    openGraph: {
        title: 'Chess Max — Play Chess vs Computer',
        description: 'Challenge AI from ELO 400 to 2000. Free, fast, beautiful.',
        type: 'website',
    },
    manifest: '/manifest.json',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning className={plusJakartaSans.variable}>
            <body suppressHydrationWarning>{children}</body>
        </html>
    );
}
