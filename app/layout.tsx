import type React from 'react'
import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Providers } from './providers'
import {
	getSiteConfig,
	ContactInfoConfig,
} from '@/lib/services/site-config-server'

const _inter = Inter({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'ETIQUETA ROJA | Premium Streetwear',
	description:
		'Premium streetwear brand. Limited drops. Exclusive pieces.',
	generator: 'v0.app',
	icons: {
		icon: [
			{
				url: '/icon-light-32x32.png',
				media: '(prefers-color-scheme: light)',
			},
			{
				url: '/icon-dark-32x32.png',
				media: '(prefers-color-scheme: dark)',
			},
			{
				url: '/icon.svg',
				type: 'image/svg+xml',
			},
		],
		apple: '/apple-icon.png',
	},
}

export const viewport: Viewport = {
	themeColor: '#E62727',
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const config = await getSiteConfig<ContactInfoConfig>(
		'contact_info'
	)
	const whatsappNumber = config?.value?.whatsapp

	return (
		<html lang="es">
			<body className={`font-sans antialiased`}>
				<Providers whatsappNumber={whatsappNumber}>
					{children}
				</Providers>
				<Analytics />
			</body>
		</html>
	)
}
