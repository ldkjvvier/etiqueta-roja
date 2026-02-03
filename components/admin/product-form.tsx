'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Trash, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ImageUpload } from '@/components/admin/image-upload'
import {
	createProduct,
	updateProduct,
} from '@/lib/actions/products-mutations'
import { Category } from '@/lib/services/products-admin-fetcher'

const formSchema = z.object({
	name: z
		.string()
		.min(2, 'El nombre debe tener al menos 2 caracteres'),
	description: z.string().optional(),
	price: z.coerce.number().min(0.01),
	original_price: z.coerce.number().optional().nullable(),
	category_id: z.string().min(1, 'Selecciona una categoría'),
	images: z.array(z.string()).min(1, 'Sube al menos una imagen'),
	variants: z
		.array(
			z.object({
				id: z.string().optional(),
				size: z.string().min(1, 'Talla requerida'),
				stock_quantity: z.coerce.number().min(0),
				sku: z.string().optional().nullable(),
			}),
		)
		.min(1, 'Agrega al menos una variante (talla/stock)'),
})

type ProductFormValues = z.infer<typeof formSchema>

interface ProductFormProps {
	initialData?: any
	categories: Category[]
}

export function ProductForm({
	initialData,
	categories,
}: ProductFormProps) {
	const router = useRouter()
	const [loading, setLoading] = useState(false)

	// Merge image column + images array for UI
	const defaultImages = initialData
		? [initialData.image, ...(initialData.images || [])].filter(
				Boolean,
			)
		: []

	const form = useForm<ProductFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: initialData
			? {
					name: initialData.name,
					description: initialData.description || '',
					price: initialData.price,
					original_price: initialData.original_price,
					category_id: initialData.category_id || '',
					images: defaultImages,
					variants:
						initialData.variants && initialData.variants.length > 0
							? initialData.variants.map((v: any) => ({
									...v,
									sku: v.sku || '',
								}))
							: [{ size: 'M', stock_quantity: 0, sku: '' }],
				}
			: {
					name: '',
					description: '',
					price: 0,
					original_price: null,
					category_id: '',
					images: [],
					variants: [{ size: 'M', stock_quantity: 0, sku: '' }],
				},
	})

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'variants',
	})

	const onSubmit = async (data: ProductFormValues) => {
		try {
			setLoading(true)

			// Format for backend
			// First image is 'image', rest are 'images'
			const [mainImage, ...galleryImages] = data.images
			const payload = {
				...data,
				image: mainImage,
				images: galleryImages,
			}

			let result
			if (initialData) {
				result = await updateProduct(initialData.id, payload)
			} else {
				result = await createProduct(payload)
			}

			if (result.error) {
				alert(result.message)
			} else {
				router.push('/admin/products')
				router.refresh()
			}
		} catch (error) {
			console.error(error)
		} finally {
			setLoading(false)
		}
	}

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit, (errors) => {
				console.error('Validation errors:', errors)
				// Create a list of missing fields for the alert
				const missingFields = Object.keys(errors).join(', ')
				alert(
					`No se puede guardar. Revise los siguientes campos: ${missingFields}. Verifique que hay al menos una imagen y una variante.`,
				)
			})}
			className="space-y-8 max-w-5xl"
		>
			<div className="grid gap-8 md:grid-cols-2">
				{/* Left Column: Details */}
				<div className="space-y-6">
					<Card>
						<CardContent className="pt-6 space-y-4">
							<div className="space-y-2">
								<Label>Nombre del Producto</Label>
								<Input
									{...form.register('name')}
									placeholder="Ej: Oversized Hoodie Black"
								/>
								{form.formState.errors.name && (
									<p className="text-red-500 text-sm">
										{form.formState.errors.name.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label>Descripción</Label>
								<Textarea
									{...form.register('description')}
									placeholder="Descripción detallada..."
								/>
							</div>

							<div className="space-y-2">
								<Label>Categoría</Label>
								<Select
									onValueChange={(val) =>
										form.setValue('category_id', val)
									}
									defaultValue={form.getValues('category_id')}
								>
									<SelectTrigger>
										<SelectValue placeholder="Seleccionar..." />
									</SelectTrigger>
									<SelectContent>
										{categories.map((c) => (
											<SelectItem key={c.id} value={c.id}>
												{c.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{form.formState.errors.category_id && (
									<p className="text-red-500 text-sm">
										{form.formState.errors.category_id.message}
									</p>
								)}
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Precio ($)</Label>
									<Input
										type="number"
										step="0.01"
										{...form.register('price')}
									/>
								</div>
								<div className="space-y-2">
									<Label>Precio Original (Opcional)</Label>
									<Input
										type="number"
										step="0.01"
										{...form.register('original_price')}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6 space-y-4">
							<Label>Imagenes</Label>
							<ImageUpload
								value={form.watch('images')}
								onChange={(urls) => form.setValue('images', urls)}
							/>
							{form.formState.errors.images && (
								<p className="text-red-500 text-sm">
									{form.formState.errors.images.message}
								</p>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Right Column: Variants */}
				<div className="space-y-6">
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center justify-between mb-4">
								<Label className="text-lg font-bold">
									Variantes / Stock
								</Label>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() =>
										append({ size: '', stock_quantity: 0, sku: '' })
									}
								>
									<Plus className="mr-2 h-4 w-4" /> Agregar Talle
								</Button>
							</div>

							<div className="space-y-4">
								{fields.map((field, index) => (
									<div
										key={field.id}
										className="flex gap-4 items-end border p-4 rounded-lg bg-gray-50/50"
									>
										<div className="flex-1 space-y-2">
											<Label>Talle</Label>
											<Input
												{...form.register(`variants.${index}.size`)}
												placeholder="S, M, L..."
											/>
											{form.formState.errors.variants?.[index]
												?.size && (
												<p className="text-red-500 text-xs">
													Requerido
												</p>
											)}
										</div>
										<div className="flex-1 space-y-2">
											<Label>Stock</Label>
											<Input
												type="number"
												{...form.register(
													`variants.${index}.stock_quantity`,
												)}
											/>
											{form.formState.errors.variants?.[index]
												?.stock_quantity && (
												<p className="text-red-500 text-xs">
													Requerido
												</p>
											)}
										</div>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => remove(index)}
										>
											<Trash className="h-4 w-4 text-red-500" />
										</Button>
									</div>
								))}
							</div>
							{form.formState.errors.variants && (
								<p className="text-red-500 text-sm mt-2">
									{form.formState.errors.variants.message}
								</p>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			<Button
				type="submit"
				disabled={
					loading || (!!initialData && !form.formState.isDirty)
				}
				className="w-full md:w-auto"
			>
				{loading
					? 'Guardando...'
					: initialData
						? 'Actualizar Producto'
						: 'Crear Producto'}
			</Button>
		</form>
	)
}
