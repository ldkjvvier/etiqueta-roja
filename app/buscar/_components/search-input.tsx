'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

interface Props {
	value: string
	onChange: (next: string) => void
	isPending: boolean
}

/**
 * Input con estado local para respuesta inmediata al teclear; el valor se
 * propaga a la URL con debounce. Si el valor de la URL cambia por una fuente
 * externa (botón atrás, limpiar filtros) el input se re-sincroniza.
 */
export function SearchInput({ value, onChange, isPending }: Props) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [text, setText] = useState(value)
	const debounced = useDebounce(text, 300)
	const lastPushed = useRef(value)

	// Propaga a la URL solo cuando el valor estabilizado difiere del último
	// empujado (evita navegaciones redundantes y bucles).
	useEffect(() => {
		if (debounced !== lastPushed.current) {
			lastPushed.current = debounced
			onChange(debounced)
		}
	}, [debounced, onChange])

	// Re-sincroniza el input cuando la URL cambia desde fuera.
	useEffect(() => {
		if (value !== lastPushed.current) {
			lastPushed.current = value
			setText(value)
		}
	}, [value])

	return (
		<div className="relative">
			<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
				<Search
					className={`w-5 h-5 transition-colors ${
						isPending
							? 'text-foreground motion-safe:animate-pulse'
							: 'text-muted-foreground'
					}`}
					aria-hidden="true"
				/>
			</div>
			<input
				ref={inputRef}
				type="search"
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="Buscar productos..."
				className="w-full h-14 pl-12 pr-12 bg-secondary border border-border font-mono text-sm uppercase tracking-widest placeholder:text-muted-foreground placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors [&::-webkit-search-cancel-button]:hidden"
				aria-label="Buscar productos"
				aria-busy={isPending}
				autoComplete="off"
			/>
			{text && (
				<button
					type="button"
					onClick={() => {
						setText('')
						inputRef.current?.focus()
					}}
					className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
					aria-label="Limpiar búsqueda"
				>
					<X className="w-4 h-4" aria-hidden="true" />
				</button>
			)}
		</div>
	)
}
