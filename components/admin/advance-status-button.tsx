'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

type StatusActionResult = {
	error: boolean
	message: string
}

interface AdvanceStatusButtonProps {
	itemId: string
	fieldName: string
	label: string
	pendingLabel?: string
	disabled?: boolean
	action: (formData: FormData) => Promise<StatusActionResult>
}

export function AdvanceStatusButton({
	itemId,
	fieldName,
	label,
	pendingLabel = 'Procesando...',
	disabled = false,
	action,
}: AdvanceStatusButtonProps) {
	const [isPending, startTransition] = useTransition()

	return (
		<Button
			type="button"
			size="sm"
			variant="outline"
			disabled={disabled || isPending}
			onClick={() => {
				startTransition(async () => {
					const formData = new FormData()
					formData.set(fieldName, itemId)

					try {
						const result = await action(formData)
						if (result.error) {
							toast.error('Error', {
								description: result.message,
							})
							return
						}

						toast.success('Estado actualizado', {
							description: result.message,
						})
					} catch (error) {
						const message =
							error instanceof Error
								? error.message
								: 'No se pudo actualizar el estado'
						console.error('[AdvanceStatusButton]', error)
						toast.error('Error', { description: message })
					}
				})
			}}
		>
			{isPending ? pendingLabel : label}
		</Button>
	)
}