'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CollapsibleDescriptionProps {
	text: string
	/** Caracteres a partir de los cuales se activa el colapso */
	threshold?: number
}

export function CollapsibleDescription({
	text,
	threshold = 220,
}: CollapsibleDescriptionProps) {
	const [expanded, setExpanded] = useState(false)
	const isLong = text.length > threshold

	return (
		<div>
			<p
				className={cn(
					'text-foreground leading-relaxed',
					!expanded && isLong && 'line-clamp-4',
				)}
			>
				{text}
			</p>
			{isLong && (
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
