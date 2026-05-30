'use client'

import { ImageIcon, Smartphone, Video } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { HeroSidebarSection } from './HeroSidebarSection'
import { HeroSectionProps } from './section-props'

async function fileToDataUrl(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(String(reader.result ?? ''))
		reader.onerror = () =>
			reject(new Error('No se pudo leer la imagen'))
		reader.readAsDataURL(file)
	})
}

export function HeroSectionMedia({
	form,
	setField,
}: HeroSectionProps) {
	const backgroundImage = form.watch('backgroundImage')
	const backgroundImageMobile = form.watch('backgroundImageMobile')
	const backgroundVideoUrl = form.watch('backgroundVideoUrl')
	const missingImage = !backgroundImage?.trim()

	const handleUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
		target: 'backgroundImage' | 'backgroundImageMobile',
	) => {
		const file = event.target.files?.[0]
		if (!file) {
			return
		}
		const url = await fileToDataUrl(file)
		form.setValue(target, url)
		setField('media', target, url)
	}

	return (
		<HeroSidebarSection
			title="Media"
			description="Imagen, video y vista mobile"
			icon={<ImageIcon className="h-4 w-4" />}
		>
			<div className="space-y-2">
				<Label htmlFor="background_image">
					Imagen de Fondo (URL){' '}
					<span className="text-destructive">*</span>
				</Label>
				<Input
					id="background_image"
					{...form.register('backgroundImage', {
						onChange: (event) =>
							setField(
								'media',
								'backgroundImage',
								event.target.value,
							),
					})}
					placeholder="https://..."
				/>
				<Input
					type="file"
					accept="image/*"
					onChange={(event) => handleUpload(event, 'backgroundImage')}
				/>
				{missingImage && (
					<p className="text-xs text-destructive">
						La imagen de fondo es obligatoria.
					</p>
				)}
			</div>

			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<Smartphone className="h-4 w-4 text-muted-foreground" />
					<Label htmlFor="background_image_mobile">
						Imagen Mobile (URL)
					</Label>
				</div>
				<Input
					id="background_image_mobile"
					{...form.register('backgroundImageMobile', {
						onChange: (event) =>
							setField(
								'media',
								'backgroundImageMobile',
								event.target.value,
							),
					})}
					placeholder="https://..."
				/>
				<Input
					type="file"
					accept="image/*"
					onChange={(event) =>
						handleUpload(event, 'backgroundImageMobile')
					}
				/>
			</div>

			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<Video className="h-4 w-4 text-muted-foreground" />
					<Label htmlFor="background_video_url">
						Video Fondo (URL)
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
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-2">
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Desktop
					</p>
					<div className="aspect-video overflow-hidden rounded-md border bg-secondary">
						{backgroundImage ? (
							<img
								src={backgroundImage}
								alt="Preview desktop"
								className="h-full w-full object-cover"
							/>
						) : null}
					</div>
				</div>
				<div className="space-y-2">
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Mobile
					</p>
					<div className="aspect-[9/16] overflow-hidden rounded-md border bg-secondary">
						{backgroundImageMobile || backgroundImage ? (
							<img
								src={backgroundImageMobile || backgroundImage}
								alt="Preview mobile"
								className="h-full w-full object-cover"
							/>
						) : null}
					</div>
				</div>
			</div>
			<p className="text-xs text-muted-foreground">
				Focal point y crop avanzado: recomendado integrar en siguiente
				iteración con editor visual dedicado.
			</p>
		</HeroSidebarSection>
	)
}
