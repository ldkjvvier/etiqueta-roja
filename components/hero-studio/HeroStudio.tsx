'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { updateHomeHeroBanner } from '@/lib/actions/site-config'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { HeroCanvasPreview } from './HeroCanvasPreview'
import { HeroRealViewEditor } from './HeroRealViewEditor'
import { HeroConfigForm } from './HeroConfigForm'
import { HeroPositionControls } from './HeroPositionControls'
import {
	buildDropPreview,
	isValidExternalVideoUrl,
} from '@/services/heroDropService'
import { useHeroStudioState } from '@/hooks/useHeroStudioState'
import { HeroDropOption } from '@/types/heroStudio.types'
import { HomeHeroBannerConfig } from '@/lib/services/site-config-server'

const initialActionState = { message: '', error: false }

interface HeroStudioProps {
	initialData?: HomeHeroBannerConfig
	isActive?: boolean
	initialDescription?: string | null
	dropOptions?: HeroDropOption[]
}

export function HeroStudio({
	initialData,
	isActive,
	initialDescription,
	dropOptions,
}: HeroStudioProps) {
	const [actionState, formAction, isPending] = useActionState(
		updateHomeHeroBanner,
		initialActionState,
	)
	const [isStudioOpen, setIsStudioOpen] = useState(false)
	const [isRealViewOpen, setIsRealViewOpen] = useState(false)
	const [previewNowMs, setPreviewNowMs] = useState<number>(() =>
		Date.now(),
	)

	const { state, dispatch, selectedDrop, submitPayload } =
		useHeroStudioState({
			initialData,
			isActive,
			initialDescription,
			dropOptions,
		})

	const hasInvalidVideoUrl = useMemo(
		() => !isValidExternalVideoUrl(state.media.backgroundVideoUrl),
		[state.media.backgroundVideoUrl],
	)

	const dropPreview = useMemo(() => {
		return buildDropPreview(state, selectedDrop, previewNowMs)
	}, [previewNowMs, selectedDrop, state])

	useEffect(() => {
		if (!isStudioOpen && isRealViewOpen) {
			setIsRealViewOpen(false)
		}
	}, [isRealViewOpen, isStudioOpen])

	useEffect(() => {
		if (!isStudioOpen) {
			return
		}

		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				if (isRealViewOpen) {
					setIsRealViewOpen(false)
					return
				}
				setIsStudioOpen(false)
			}
		}

		window.addEventListener('keydown', onKeyDown)
		return () => {
			document.body.style.overflow = previousOverflow
			window.removeEventListener('keydown', onKeyDown)
		}
	}, [isRealViewOpen, isStudioOpen])

	useEffect(() => {
		if (!isStudioOpen) {
			return
		}

		const intervalId = window.setInterval(() => {
			setPreviewNowMs(Date.now())
		}, 1000)

		return () => window.clearInterval(intervalId)
	}, [isStudioOpen])

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Hero Banner Home</CardTitle>
					<CardDescription>
						Controla contenido, branding y layout desde un editor
						full-screen.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="rounded-lg border bg-muted/20 p-4">
						<p className="text-sm font-medium">Título actual</p>
						<p className="mt-1 text-sm text-muted-foreground">
							{state.content.title || 'Sin título definido'}
						</p>
						<p className="mt-2 text-xs text-muted-foreground">
							Estado: {state.isActive ? 'Activo' : 'Inactivo'}
						</p>
					</div>
					<Button
						type="button"
						onClick={() => setIsStudioOpen(true)}
						aria-haspopup="dialog"
						aria-expanded={isStudioOpen}
						aria-controls="hero-studio-dialog"
					>
						Abrir Hero Studio
					</Button>
					{actionState.message && (
						<p
							className={`text-sm ${
								actionState.error
									? 'text-destructive'
									: 'text-green-600'
							}`}
						>
							{actionState.message}
						</p>
					)}
				</CardContent>
			</Card>

			{isStudioOpen && (
				<div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
					<form action={formAction} className="flex h-full flex-col">
						<div
							id="hero-studio-dialog"
							role="dialog"
							aria-modal="true"
							aria-labelledby="hero-studio-title"
							aria-describedby="hero-studio-description"
							className="flex h-full flex-col"
						>
							<input
								type="hidden"
								name="hero_payload"
								value={JSON.stringify(submitPayload)}
							/>
							<div className="flex items-center justify-between border-b bg-background px-5 py-3">
								<div>
									<h2
										id="hero-studio-title"
										className="text-sm font-semibold"
									>
										Hero Studio
									</h2>
									<p
										id="hero-studio-description"
										className="text-xs text-muted-foreground"
									>
										Editor dedicado del banner principal.
									</p>
								</div>
								<div className="flex items-center gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsStudioOpen(false)}
									>
										Cerrar
									</Button>
									<Button
										type="submit"
										disabled={isPending || hasInvalidVideoUrl}
									>
										{isPending ? 'Guardando...' : 'Guardar Hero'}
									</Button>
								</div>
							</div>

							<div className="grid flex-1 grid-cols-12 gap-4 overflow-hidden p-4">
								<HeroPositionControls
									state={state}
									selectedDrop={selectedDrop}
									dropPreview={dropPreview}
									onResetPositions={() =>
										dispatch({ type: 'resetPositions' })
									}
								/>
								<HeroCanvasPreview
									state={state}
									dropPreview={dropPreview}
									onOpenRealView={() => setIsRealViewOpen(true)}
								/>
								<HeroConfigForm
									state={state}
									dispatch={dispatch}
									dropOptions={dropOptions}
								/>
							</div>

							{actionState.message && (
								<div className="border-t bg-background px-5 py-2">
									<p
										className={`text-sm ${
											actionState.error
												? 'text-destructive'
												: 'text-green-600'
										}`}
									>
										{actionState.message}
									</p>
								</div>
							)}
						</div>
					</form>
				</div>
			)}

			<HeroRealViewEditor
				open={isRealViewOpen}
				state={state}
				dropPreview={dropPreview}
				onClose={() => setIsRealViewOpen(false)}
				onPositionChange={(target, x, y) =>
					dispatch({
						type: 'setPosition',
						element: target,
						position: { x, y },
					})
				}
			/>
		</>
	)
}
