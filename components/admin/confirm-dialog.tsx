'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'

import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description: string
	onConfirm: () => void
	confirmLabel?: string
	loadingLabel?: string
	cancelLabel?: string
	loading?: boolean
}

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	onConfirm,
	confirmLabel = 'Confirmar',
	loadingLabel,
	cancelLabel = 'Cancelar',
	loading = false,
}: ConfirmDialogProps) {
	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-lg focus:outline-none">
					<div className="space-y-2">
						<DialogPrimitive.Title className="text-lg font-semibold text-foreground">
							{title}
						</DialogPrimitive.Title>
						<DialogPrimitive.Description className="text-sm text-muted-foreground">
							{description}
						</DialogPrimitive.Description>
					</div>

					<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
						<DialogPrimitive.Close asChild>
							<Button type="button" variant="outline" disabled={loading}>
								{cancelLabel}
							</Button>
						</DialogPrimitive.Close>
						<Button
							type="button"
							variant="destructive"
							onClick={onConfirm}
							disabled={loading}
							aria-busy={loading}
						>
							{loading ? loadingLabel || confirmLabel : confirmLabel}
						</Button>
					</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	)
}