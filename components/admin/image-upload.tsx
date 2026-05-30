'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

interface ImageUploadProps {
	value: string[]
	onChange: (urls: string[]) => void
	maxImages?: number
	/** Called right after a file is successfully uploaded to storage */
	onUploaded?: (url: string) => void
	/** Called right before an image is removed from the list */
	onBeforeRemove?: (url: string) => void
}

export function ImageUpload({
	value = [],
	onChange,
	maxImages = 5,
	onUploaded,
	onBeforeRemove,
}: ImageUploadProps) {
	const [uploading, setUploading] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	const storeId = process.env.NEXT_PUBLIC_STORE_ID ?? 'store'

	const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			const files = e.target.files
			if (!files || files.length === 0) return

			const remainingSlots = Math.max(maxImages - value.length, 0)
			if (remainingSlots === 0) {
				toast.error(`Solo puedes subir hasta ${maxImages} imágenes.`)
				return
			}

			const selectedFiles = Array.from(files).slice(0, remainingSlots)
			if (selectedFiles.length < files.length) {
				toast.error('Se superó el máximo de imágenes permitido.', {
					description: `Solo se subirán ${selectedFiles.length} imágenes.`,
				})
			}

			setUploading(true)
			const supabase = createClient()
			const newUrls: string[] = []

			for (const file of selectedFiles) {
				if (!ALLOWED_TYPES.includes(file.type)) {
					toast.error('Formato no permitido', {
						description: `${file.name}: usa JPG, PNG, WEBP o AVIF.`,
					})
					continue
				}
				if (file.size > MAX_BYTES) {
					toast.error('Imagen demasiado grande', {
						description: `${file.name} supera 5 MB.`,
					})
					continue
				}

				const fileExt = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
				const filePath = `${storeId}/${crypto.randomUUID()}.${fileExt}`

				const { error: uploadError } = await supabase.storage
					.from('products')
					.upload(filePath, file, {
						contentType: file.type,
						cacheControl: '3600',
					})

				if (uploadError) {
					throw uploadError
				}

				const {
					data: { publicUrl },
				} = supabase.storage.from('products').getPublicUrl(filePath)

				newUrls.push(publicUrl)
				onUploaded?.(publicUrl)
			}

			if (newUrls.length) {
				onChange([...value, ...newUrls].slice(0, maxImages))
			}
		} catch (error) {
			toast.error('Error al subir imagen', {
				description:
					'Revisa el archivo seleccionado o intenta nuevamente en unos segundos.',
			})
			console.error(error)
		} finally {
			setUploading(false)
			e.target.value = ''
		}
	}

	const onRemove = (url: string) => {
		onBeforeRemove?.(url)
		onChange(value.filter((current) => current !== url))
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-4">
				{value.map((url) => (
					<div
						key={url}
						className="relative w-50 h-50 rounded-md overflow-hidden border"
					>
						<div className="z-10 absolute top-2 right-2">
							<Button
								type="button"
								onClick={() => onRemove(url)}
								variant="destructive"
								size="icon"
								aria-label="Eliminar imagen"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
						<Image
							fill
							className="object-cover"
							alt="Imagen del producto"
							src={url}
						/>
					</div>
				))}
			</div>
			<div>
				<Button
					type="button"
					variant="secondary"
					disabled={uploading || value.length >= maxImages}
					onClick={() => inputRef.current?.click()}
					aria-busy={uploading}
				>
					{uploading ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<ImagePlus className="mr-2 h-4 w-4" />
					)}
					{uploading ? 'Subiendo...' : 'Subir Imágenes'}
				</Button>
				<input
					ref={inputRef}
					type="file"
					accept={ALLOWED_TYPES.join(',')}
					multiple
					className="hidden"
					onChange={onUpload}
					disabled={uploading}
				/>
			</div>
			<p className="text-xs text-muted-foreground">
				Sube hasta {maxImages} imagen{maxImages !== 1 ? 'es' : ''}. Formatos: JPG, PNG, WEBP, AVIF · Máx 5 MB.
				{maxImages > 1 && ' La primera será la portada.'}
			</p>
		</div>
	)
}
