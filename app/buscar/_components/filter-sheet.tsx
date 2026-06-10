'use client'

import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetFooter,
	SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import type { SearchFacets } from '@/lib/services/products-server'
import {
	countActiveFilters,
	type SearchFilters,
} from '@/lib/search/filters'
import { FilterControls } from './filter-controls'

interface Props {
	filters: SearchFilters
	facets: SearchFacets
	apply: (update: Partial<SearchFilters>) => void
	onClearAll: () => void
	resultLabel: string
}

/**
 * Disparador flotante + bottom-sheet de filtros para móvil. Las acciones se
 * aplican en vivo a la URL; el footer solo confirma/cierra.
 */
export function FilterSheet({
	filters,
	facets,
	apply,
	onClearAll,
	resultLabel,
}: Props) {
	const [open, setOpen] = useState(false)
	const activeCount = countActiveFilters(filters)

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			{/* Botón flotante (solo móvil) */}
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-2 h-12 pl-5 pr-5 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-widest shadow-lg active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				aria-label="Abrir filtros"
			>
				<SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
				Filtros
				{activeCount > 0 && (
					<span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1 bg-background text-foreground rounded-full text-[10px] tabular-nums">
						{activeCount}
					</span>
				)}
			</button>

			<SheetContent
				side="bottom"
				className="max-h-[85dvh] rounded-t-xl p-0 gap-0"
			>
				<SheetHeader className="flex-row items-center justify-between border-b border-border px-4 py-4">
					<SheetTitle className="font-mono text-sm uppercase tracking-widest">
						Filtros
					</SheetTitle>
					{activeCount > 0 && (
						<button
							type="button"
							onClick={onClearAll}
							className="font-mono text-[11px] font-bold uppercase tracking-widest text-primary-strong hover:underline"
						>
							Limpiar
						</button>
					)}
				</SheetHeader>

				<div className="overflow-y-auto px-4">
					<FilterControls
						filters={filters}
						facets={facets}
						apply={apply}
					/>
				</div>

				<SheetFooter className="border-t border-border">
					<SheetClose asChild>
						<Button
							className="w-full h-12 font-mono text-xs font-bold uppercase tracking-widest"
							size="lg"
						>
							Ver {resultLabel}
						</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}
