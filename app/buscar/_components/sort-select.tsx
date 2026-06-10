'use client'

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { SORT_OPTIONS, type SearchSort } from '@/lib/search/filters'

interface Props {
	value: SearchSort
	onChange: (next: SearchSort) => void
}

export function SortSelect({ value, onChange }: Props) {
	return (
		<Select
			value={value}
			onValueChange={(v) => onChange(v as SearchSort)}
		>
			<SelectTrigger
				className="h-11 w-full sm:w-56 font-mono text-xs uppercase tracking-widest border-border"
				aria-label="Ordenar resultados"
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{SORT_OPTIONS.map((option) => (
					<SelectItem
						key={option.value}
						value={option.value}
						className="font-mono text-xs uppercase tracking-wide"
					>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
