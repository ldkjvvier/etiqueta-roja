'use client'

import { useEffect } from 'react'

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error('[Error boundary]', error)
	}, [error])

	return (
		<main
			id="main-content"
			tabIndex={-1}
			className="flex-1 flex items-start py-24"
		>
			<div className="container mx-auto px-4 flex flex-col gap-6 max-w-xl">
				<h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-balance">
					ERROR AL CARGAR
				</h1>
				<p className="font-mono text-sm text-muted-foreground leading-relaxed">
					No se pudieron cargar los productos. Verifica tu conexion e intenta de
					nuevo.
				</p>
				<button
					onClick={reset}
					className="self-start border-2 border-foreground px-6 py-3 font-black text-sm uppercase tracking-wider transition-colors duration-200 hover:bg-primary hover:border-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					autoFocus
				>
					REINTENTAR
				</button>
			</div>
		</main>
	)
}
