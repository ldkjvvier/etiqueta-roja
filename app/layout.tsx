import type React from 'react'
import type { Metadata, Viewport } from 'next'
import { Archivo, Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Providers } from './providers'
import {
	getSiteConfig,
	ContactInfoConfig,
} from '@/lib/data/site-config'

const geist = Geist({
	subsets: ['latin'],
	variable: '--font-geist-sans',
	display: 'swap',
})

const archivo = Archivo({
	subsets: ['latin'],
	axes: ['wdth'], // necesario para el ancho Expanded en titulares
	variable: '--font-archivo',
	display: 'swap',
})

const geistMono = Geist_Mono({
	subsets: ['latin'],
	variable: '--font-geist-mono',
	display: 'swap',
})

export const metadata: Metadata = {
	title: 'ETIQUETA ROJA | Streetwear premium',
	description:
		'Marca de streetwear premium. Drops limitados. Piezas exclusivas.',
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
	const config =
		await getSiteConfig<ContactInfoConfig>('contact_info')
	const whatsappNumber = config?.value?.whatsapp

	return (
		<html lang="es">
			<body
				className={`${geist.variable} ${archivo.variable} ${geistMono.variable} font-sans antialiased`}
			>
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-primary focus:px-4 focus:py-2 focus:font-bold focus:text-primary-foreground"
				>
					Saltar al contenido principal
				</a>
				<Providers whatsappNumber={whatsappNumber}>
					{children}
				</Providers>
				<Analytics />
			</body>
		</html>
	)
}
