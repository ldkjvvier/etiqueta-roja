'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
	return (
		<div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
			{/* Glitch effect container */}
			<div className="relative mb-8">
				<h1 className="text-[150px] sm:text-[200px] md:text-[280px] font-black text-primary leading-none tracking-tighter select-none">
					404
				</h1>
				{/* Glitch layers ocultas para lectores de pantalla */}
				<h1
					aria-hidden="true"
					className="absolute inset-0 text-[150px] sm:text-[200px] md:text-[280px] font-black text-foreground leading-none tracking-tighter select-none opacity-10 translate-x-2 translate-y-1"
				>
					404
				</h1>
				<h1
					aria-hidden="true"
					className="absolute inset-0 text-[150px] sm:text-[200px] md:text-[280px] font-black text-primary leading-none tracking-tighter select-none opacity-20 -translate-x-1 -translate-y-1"
				>
					404
				</h1>
			</div>

			{/* Error message */}
			<div className="text-center max-w-md">
				<p className="font-mono text-xs text-muted-foreground mb-2 tracking-widest">
					[ ERROR // PÁGINA NO ENCONTRADA ]
				</p>
				<h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-4">
					ESTE DROP NO EXISTE
				</h2>
				<p className="text-muted-foreground mb-8 font-mono text-sm">
					La página que buscas se agotó o nunca existió.
					<br />
					Vuelve al catálogo antes de que se acabe el stock real.
				</p>
			</div>

			{/* CTA Button */}
			<Link
				href="/"
				className="group flex items-center gap-3 bg-foreground text-background px-8 py-4 font-black text-sm uppercase tracking-wider hover:bg-primary transition-colors"
			>
				<ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
				VOLVER AL CATÁLOGO
			</Link>

			{/* Decorative elements */}
			<div className="absolute bottom-8 left-8 hidden md:block">
				<div className="font-mono text-[10px] text-muted-foreground/50 leading-tight">
					<p>ETIQUETA_R*JA</p>
					<p>SYS::ERR_404</p>
					<p>STATUS::LOST</p>
				</div>
			</div>

			<div className="absolute bottom-8 right-8 hidden md:block">
				<div className="font-mono text-[10px] text-muted-foreground/50 leading-tight text-right">
					<p>STREETWEAR</p>
					<p>EXCLUSIVE</p>
					<p>2024—∞</p>
				</div>
			</div>

			{/* Top decorative bar */}
			<div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
		</div>
	)
}
