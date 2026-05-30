'use client'

import { useRef, useState } from 'react'
import { ImageIcon, Loader2, Smartphone, Upload, Video, X } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { HeroSidebarSection } from './HeroSidebarSection'
import { HeroSectionProps } from './section-props'

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = [
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/avif',
]

interface HeroImageFieldProps {
	label: string
	help?: string
	value: string
	required?: boolean
	aspect: 'video' | 'portrait'
	icon?: React.ReactNode
	onChange: (url: string) => void
}

function HeroImageField({
	label,
	help,
	value,
	required = false,
	aspect,
	icon,
	onChange,
}: HeroImageFieldProps) {
	const [uploading, setUploading] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)
	const storeId = process.env.NEXT_PUBLIC_STORE_ID ?? 'store'

	const handleUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0]
		event.target.value = ''
		if (!file) {
			return
		}
		if (!ALLOWED_TYPES.includes(file.type)) {
			toast.error('Formato no permitido', {
				description: 'Usa JPG, PNG, WEBP o AVIF.',
			})
			return
		}
		if (file.size > MAX_BYTES) {
			toast.error('Imagen demasiado grande', {
				description: `${file.name} supera el máximo de 5 MB.`,
			})
			return
		}

		try {
			setUploading(true)
			const supabase = createClient()
			const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
			const path = `${storeId}/hero/${crypto.randomUUID()}.${ext}`

			const { error: uploadError } = await supabase.storage
				.from('products')
				.upload(path, file, {
					contentType: file.type,
					cacheControl: '3600',
				})
			if (uploadError) {
				throw uploadError
			}

			const {
				data: { publicUrl },
			} = supabase.storage.from('products').getPublicUrl(path)

			onChange(publicUrl)
			toast.success('Imagen subida correctamente')
		} catch (error) {
			toast.error('Error al subir imagen', {
				description:
					'Revisa el archivo o intenta nuevamente en unos segundos.',
			})
			console.error('[HeroSectionMedia.upload]', error)
		} finally {
			setUploading(false)
		}
	}

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				{icon}
				<Label>
					{label}
					{required && <span className="text-destructive"> *</span>}
				</Label>
			</div>

			<div
				className={`relative w-full overflow-hidden rounded-md border bg-secondary ${
					aspect === 'portrait' ? 'aspect-9/16 max-w-40' : 'aspect-video'
				}`}
			>
				{value ? (
					<>
						<Image
							src={value}
							alt=""
							fill
							sizes="(max-width: 768px) 100vw, 320px"
							className="object-cover"
						/>
						<button
							type="button"
							onClick={() => onChange('')}
							aria-label="Quitar imagen"
							className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-md bg-destructive text-destructive-foreground shadow"
						>
							<X className="h-4 w-4" />
						</button>
					</>
				) : (
					<div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
						<ImageIcon className="h-6 w-6" />
						<span className="text-[11px]">Sin imagen</span>
					</div>
				)}
			</div>

			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="secondary"
					size="sm"
					disabled={uploading}
					aria-busy={uploading}
					onClick={() => inputRef.current?.click()}
				>
					{uploading ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<Upload className="mr-2 h-4 w-4" />
					)}
					{uploading ? 'Subiendo...' : value ? 'Reemplazar' : 'Subir imagen'}
				</Button>
				<input
					ref={inputRef}
					type="file"
					accept={ALLOWED_TYPES.join(',')}
					className="hidden"
					onChange={handleUpload}
					disabled={uploading}
				/>
			</div>

			{help && (
				<p className="text-xs text-muted-foreground">{help}</p>
			)}
			{required && !value && (
				<p className="text-xs text-destructive">
					La imagen de fondo es obligatoria.
				</p>
			)}
		</div>
	)
}

export function HeroSectionMedia({ form, setField }: HeroSectionProps) {
	const backgroundImage = form.watch('backgroundImage')
	const backgroundImageMobile = form.watch('backgroundImageMobile')

	const setImage = (
		field: 'backgroundImage' | 'backgroundImageMobile',
		url: string,
	) => {
		form.setValue(field, url)
		setField('media', field, url)
	}

	return (
		<HeroSidebarSection
			title="Media"
			description="Imagen de fondo y video (solo carga de archivos)"
			icon={<ImageIcon className="h-4 w-4" />}
		>
			<HeroImageField
				label="Imagen de fondo"
				help="Formatos: JPG, PNG, WEBP, AVIF · Máx 5 MB. Se sube a tu almacenamiento seguro."
				value={backgroundImage}
				required
				aspect="video"
				onChange={(url) => setImage('backgroundImage', url)}
			/>

			<HeroImageField
				label="Imagen mobile (opcional)"
				help="Si la dejas vacía se usa la imagen de fondo principal."
				value={backgroundImageMobile}
				aspect="portrait"
				icon={<Smartphone className="h-4 w-4 text-muted-foreground" />}
				onChange={(url) => setImage('backgroundImageMobile', url)}
			/>

			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<Video className="h-4 w-4 text-muted-foreground" />
					<Label htmlFor="background_video_url">
						Video de fondo (URL externa)
					</Label>
				</div>
				<Input
					id="background_video_url"
					{...form.register('backgroundVideoUrl', {
						onChange: (event) =>
							setField(
								'media',
								'backgroundVideoUrl',
								event.target.value,
							),
					})}
					placeholder="https://player.vimeo.com/..."
				/>
				<p className="text-xs text-muted-foreground">
					Solo para video embebible (Vimeo/YouTube). Las imágenes deben
					subirse como archivo.
				</p>
			</div>
		</HeroSidebarSection>
	)
}
