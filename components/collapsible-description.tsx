'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CollapsibleDescriptionProps {
	text: string
}

export function CollapsibleDescription({ text }: CollapsibleDescriptionProps) {
	const [expanded, setExpanded] = useState(false)
	const [isClamped, setIsClamped] = useState(false)
	const ref = useRef<HTMLParagraphElement>(null)

	useEffect(() => {
		const el = ref.current
		if (!el) return
		// Medir overflow real en lugar de contar caracteres — el texto cabe
		// en 4 líneas o no dependiendo del ancho del contenedor y la fuente.
		setIsClamped(el.scrollHeight > el.clientHeight)
	}, [text])

	return (
		<div>
			<p
				ref={ref}
				className={cn(
					'text-foreground leading-relaxed',
					!expanded && 'line-clamp-4',
				)}
			>
				{text}
			</p>
			{(isClamped || expanded) && (
				<button
					type="button"
					onClick={() => setExpanded((v) => !v)}
					aria-expanded={expanded}
					className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
				>
					{expanded ? 'VER MENOS ↑' : 'VER MÁS ↓'}
				</button>
			)}
		</div>
	)
}
