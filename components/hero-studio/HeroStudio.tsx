'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { updateHomeHeroBanner } from '@/lib/actions/site-config'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { HeroStudioPreview } from './HeroStudioPreview'
import { HeroConfigForm } from './HeroConfigForm'
import {
	buildDropPreview,
	isValidExternalVideoUrl,
} from '@/services/heroDropService'
import { useHeroStudioState } from '@/hooks/useHeroStudioState'
import { HeroDropOption } from '@/types/heroStudio.types'
import { HomeHeroBannerConfig } from '@/lib/data/site-config'
import { validateHeroForSave } from '@/lib/hero/validation'

const initialActionState = { message: '', error: false }

interface HeroStudioProps {
	initialData?: HomeHeroBannerConfig
	isActive?: boolean
	dropOptions?: HeroDropOption[]
}

export function HeroStudio({
	initialData,
	isActive,
	dropOptions,
}: HeroStudioProps) {
	const [actionState, formAction, isPending] = useActionState(
		updateHomeHeroBanner,
		initialActionState,
	)
	const [isStudioOpen, setIsStudioOpen] = useState(false)
	const [previewNowMs, setPreviewNowMs] = useState<number>(() =>
		Date.now(),
	)

	const { state, dispatch, selectedDrop, submitPayload } =
		useHeroStudioState({
			initialData,
			isActive,
			dropOptions,
		})

	const hasInvalidVideoUrl = useMemo(
		() => !isValidExternalVideoUrl(state.media.backgroundVideoUrl),
		[state.media.backgroundVideoUrl],
	)

	const heroValidation = useMemo(
		() =>
			validateHeroForSave({
				backgroundImage: state.media.backgroundImage,
				description: state.content.description,
			}),
		[state.media.backgroundImage, state.content.description],
	)

	const dropPreview = useMemo(() => {
		return buildDropPreview(state, selectedDrop, previewNowMs)
	}, [previewNowMs, selectedDrop, state])

	useEffect(() => {
		if (!actionState.message) {
			return
		}

		if (actionState.error) {
			toast.error('Error al guardar', {
				description: actionState.message,
			})
			return
		}

		toast.success('Hero guardado correctamente', {
			description: actionState.message,
		})
	}, [actionState.error, actionState.message])

	useEffect(() => {
		if (!isStudioOpen) {
			return
		}

		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsStudioOpen(false)
			}
		}

		window.addEventListener('keydown', onKeyDown)
		return () => {
			document.body.style.overflow = previousOverflow
			window.removeEventListener('keydown', onKeyDown)
		}
	}, [isStudioOpen])

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
					<CardTitle>Hero principal de inicio</CardTitle>
					<CardDescription>
						Controla contenido, branding y layout desde un editor de
						pantalla completa.
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
						Abrir estudio del hero
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
							<div className="flex flex-wrap items-center justify-between gap-2 border-b bg-background px-4 py-3 sm:px-5">
								<div>
									<h2
										id="hero-studio-title"
										className="text-sm font-semibold"
									>
										Estudio del hero
									</h2>
									<p
										id="hero-studio-description"
										className="text-xs text-muted-foreground"
									>
										Editor dedicado del banner principal.
									</p>
								</div>
								<div className="flex items-center gap-2">
									{!heroValidation.ok && (
										<span className="self-center text-xs text-destructive">
											{heroValidation.errors.backgroundImage ??
												heroValidation.errors.description}
										</span>
									)}
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsStudioOpen(false)}
									>
										Cerrar
									</Button>
									<Button
										type="submit"
										disabled={
											isPending ||
											hasInvalidVideoUrl ||
											!heroValidation.ok
										}
									>
										{isPending ? 'Guardando...' : 'Guardar Hero'}
									</Button>
								</div>
							</div>

							<div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 lg:grid lg:grid-cols-12 lg:grid-rows-1 lg:overflow-hidden">
								<HeroStudioPreview
									state={state}
									dropPreview={dropPreview}
								/>
								<HeroConfigForm
									state={state}
									dispatch={dispatch}
									dropOptions={dropOptions}
									saveSignal={actionState}
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

		</>
	)
}
