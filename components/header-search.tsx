'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeaderSearch() {
	const router = useRouter()
	const [isOpen, setIsOpen] = useState(false)
	const [query, setQuery] = useState('')
	const inputRef = useRef<HTMLInputElement>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const panelRef = useRef<HTMLDivElement>(null)

	// Devuelve el foco al disparador y limpia el input al cerrar.
	function closePanel() {
		setIsOpen(false)
		setQuery('')
		triggerRef.current?.focus()
	}

	// Enfocar el input cuando el panel se abre.
	useEffect(() => {
		if (isOpen) inputRef.current?.focus()
	}, [isOpen])

	// Mientras está abierto: cerrar con Escape o click/tap fuera del panel.
	useEffect(() => {
		if (!isOpen) return

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') closePanel()
		}

		function handlePointerDown(event: PointerEvent) {
			const target = event.target as Node
			if (
				!panelRef.current?.contains(target) &&
				!triggerRef.current?.contains(target)
			) {
				closePanel()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		document.addEventListener('pointerdown', handlePointerDown)
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.removeEventListener('pointerdown', handlePointerDown)
		}
	}, [isOpen])

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const trimmed = query.trim()
		router.push(
			trimmed ? `/buscar?q=${encodeURIComponent(trimmed)}` : '/buscar',
		)
		setIsOpen(false)
		setQuery('')
	}

	return (
		<div ref={panelRef} className="relative">
			<Button
				ref={triggerRef}
				variant="ghost"
				size="icon"
				type="button"
				onClick={() => setIsOpen((open) => !open)}
				className="min-w-11 min-h-11 hover:bg-transparent hover:text-primary active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
				aria-label="Buscar"
				aria-expanded={isOpen}
				aria-controls="header-search-panel"
			>
				<Search className="h-5 w-5" />
				<span className="sr-only">Buscar</span>
			</Button>

			{isOpen && (
				<div
					id="header-search-panel"
					className="absolute right-0 top-full mt-2 w-[300px] max-w-[calc(100vw-2rem)] z-50 bg-background border border-border-strong shadow-lg animate-in fade-in zoom-in-95 slide-in-from-top-1 origin-top-right duration-150"
				>
					<form role="search" onSubmit={handleSubmit} className="p-3">
						<div className="group relative">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<Search
									className="w-4 h-4 text-muted-foreground group-focus-within:text-brand-red transition-colors"
									aria-hidden="true"
								/>
							</div>
							<input
								ref={inputRef}
								type="search"
								value={query}
								onChange={(event) =>
									setQuery(event.target.value)
								}
								placeholder="Buscar productos..."
								className="w-full h-11 pl-10 pr-10 bg-secondary border border-border font-mono text-xs uppercase tracking-widest placeholder:text-muted-foreground focus:outline-none focus:border-brand-red transition-colors"
								aria-label="Buscar productos"
								autoComplete="off"
							/>
							<button
								type="button"
								onClick={closePanel}
								className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
								aria-label="Cerrar búsqueda"
							>
								<X className="w-4 h-4" aria-hidden="true" />
							</button>
						</div>
					</form>
				</div>
			)}
		</div>
	)
}
