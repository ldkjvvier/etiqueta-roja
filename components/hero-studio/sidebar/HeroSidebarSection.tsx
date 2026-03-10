'use client'

import { ReactNode, useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface HeroSidebarSectionProps {
	title: string
	description?: string
	icon?: ReactNode
	defaultOpen?: boolean
	children: ReactNode
}

export function HeroSidebarSection({
	title,
	description,
	icon,
	defaultOpen = true,
	children,
}: HeroSidebarSectionProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen)

	return (
		<section className="rounded-xl border bg-muted/20">
			<button
				type="button"
				onClick={() => setIsOpen((current) => !current)}
				className="flex w-full items-center justify-between px-4 py-3 text-left"
			>
				<div className="flex min-w-0 items-start gap-3">
					<div className="mt-0.5 text-muted-foreground">{icon}</div>
					<div className="min-w-0">
						<p className="truncate text-sm font-semibold">{title}</p>
						{description && (
							<p className="truncate text-xs text-muted-foreground">
								{description}
							</p>
						)}
					</div>
				</div>
				<ChevronDown
					className={`h-4 w-4 text-muted-foreground transition-transform ${
						isOpen ? 'rotate-180' : ''
					}`}
				/>
			</button>
			{isOpen && (
				<div className="space-y-4 border-t p-4">{children}</div>
			)}
		</section>
	)
}
