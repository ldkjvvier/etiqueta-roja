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
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/admin/image-upload'
import {
	createProduct,
	updateProduct,
} from '@/lib/actions/products-mutations'
import {
	Category,
	DropOption,
} from '@/lib/services/products-admin-fetcher'

const optionalNullableNumber = z.preprocess((value) => {
	if (value === '' || value === null || value === undefined) {
		return null
	}
	const casted = Number(value)
	return Number.isNaN(casted) ? null : casted
}, z.number().min(0).nullable().optional())

const optionalNullableUrl = z.preprocess((value) => {
	if (value === '' || value === null || value === undefined) {
		return null
	}
	return value
}, z.string().url().nullable().optional())

const formSchema = z.object({
	// Cambiado: exponer campo existente en DB para personalización.
	is_customizable: z.boolean().default(false),
	name: z
		.string()
		.min(2, 'El nombre debe tener al menos 2 caracteres'),
	description: z.string().optional(),
	base_price: z.coerce.number().min(0.01),
	compare_at_price: optionalNullableNumber,
	category_id: z.string().min(1, 'Selecciona una categoría'),
	drop_id: z.string().optional().nullable(),
	status: z.enum(['draft', 'active', 'archived']),
	images: z.array(z.string()).min(1, 'Sube al menos una imagen'),
	variants: z
		.array(
			z.object({
				id: z.string().optional(),
				size: z.string().min(1, 'Talla requerida'),
				// Cambiado: aprovechar precio por variante del modelo actual.
				price: optionalNullableNumber,
				stock_quantity: z.coerce.number().min(0),
				reserved_stock: z.coerce.number().min(0),
				low_stock_threshold: z.coerce.number().min(0),
				sku: z.string().optional().nullable(),
				// Cambiado: exponer columnas huérfanas de variantes.
				weight: optionalNullableNumber,
				image_url: optionalNullableUrl,
				track_inventory: z.boolean().default(true),
			}),
		)
		.min(1, 'Agrega al menos una variante (talla/stock)'),
})

type ProductFormValues = z.infer<typeof formSchema>

interface ProductFormProps {
	initialData?: any
	categories: Category[]
	drops: DropOption[]
}

export function ProductForm({
	initialData,
	categories,
	drops,
}: ProductFormProps) {
	const router = useRouter()
	const [loading, setLoading] = useState(false)

	// Merge image column + images array for UI
	const defaultImages = initialData
		? [initialData.main_image, ...(initialData.images || [])].filter(
				Boolean,
			)
		: []

	const form = useForm<ProductFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: initialData
			? {
					is_customizable: Boolean(initialData.is_customizable),
					name: initialData.name,
					description: initialData.description || '',
					base_price: initialData.base_price,
					compare_at_price: initialData.compare_at_price,
					category_id: initialData.category_id || '',
					drop_id: initialData.drop_id || 'none',
					status: initialData.status || 'draft',
					images: defaultImages,
					variants:
						initialData.variants && initialData.variants.length > 0
							? initialData.variants.map((v: any) => ({
									...v,
									price: v.price ?? null,
									reserved_stock: v.reserved_stock || 0,
									low_stock_threshold: v.low_stock_threshold || 5,
									sku: v.sku || '',
									weight: v.weight ?? null,
									image_url: v.image_url ?? '',
									track_inventory: v.track_inventory ?? true,
								}))
							: [
									{
										size: 'M',
										price: null,
										stock_quantity: 0,
										reserved_stock: 0,
										low_stock_threshold: 5,
										sku: '',
										weight: null,
										image_url: '',
										track_inventory: true,
									},
								],
				}
			: {
					is_customizable: false,
					name: '',
					description: '',
					base_price: 0,
					compare_at_price: null,
					category_id: '',
					drop_id: 'none',
					status: 'draft',
					images: [],
					variants: [
						{
							size: 'M',
							price: null,
							stock_quantity: 0,
							reserved_stock: 0,
							low_stock_threshold: 5,
							sku: '',
							weight: null,
							image_url: '',
							track_inventory: true,
						},
					],
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
			const payload = {
				...data,
				drop_id: data.drop_id === 'none' ? null : data.drop_id,
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
										{...form.register('base_price')}
									/>
								</div>
								<div className="space-y-2">
									<Label>Precio Original (Opcional)</Label>
									<Input
										type="number"
										step="0.01"
										{...form.register('compare_at_price')}
									/>
								</div>
							</div>

							<div className="flex items-center justify-between rounded-md border p-3">
								<div>
									<Label htmlFor="is_customizable">
										Producto personalizable
									</Label>
									<p className="text-xs text-muted-foreground">
										Habilita customización para checkout/venta
										asistida.
									</p>
								</div>
								<Switch
									id="is_customizable"
									checked={form.watch('is_customizable')}
									onCheckedChange={(checked) =>
										form.setValue('is_customizable', checked)
									}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Drop (Opcional)</Label>
									<Select
										onValueChange={(val) =>
											form.setValue('drop_id', val)
										}
										defaultValue={form.getValues('drop_id') || 'none'}
									>
										<SelectTrigger>
											<SelectValue placeholder="Sin drop" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">Sin drop</SelectItem>
											{drops.map((d) => (
												<SelectItem key={d.id} value={d.id}>
													{d.name} ({d.status})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>Estado</Label>
									<Select
										onValueChange={(val) =>
											form.setValue(
												'status',
												val as 'draft' | 'active' | 'archived',
											)
										}
										defaultValue={form.getValues('status')}
									>
										<SelectTrigger>
											<SelectValue placeholder="Estado" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="draft">Borrador</SelectItem>
											<SelectItem value="active">Activo</SelectItem>
											<SelectItem value="archived">
												Archivado
											</SelectItem>
										</SelectContent>
									</Select>
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
										append({
											size: '',
											price: null,
											stock_quantity: 0,
											reserved_stock: 0,
											low_stock_threshold: 5,
											sku: '',
											weight: null,
											image_url: '',
											track_inventory: true,
										})
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
											<Label>Precio Var.</Label>
											<Input
												type="number"
												step="0.01"
												{...form.register(`variants.${index}.price`)}
											/>
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
										<div className="flex-1 space-y-2">
											<Label>Reservado</Label>
											<Input
												type="number"
												{...form.register(
													`variants.${index}.reserved_stock`,
												)}
											/>
										</div>
										<div className="flex-1 space-y-2">
											<Label>Umbral Bajo</Label>
											<Input
												type="number"
												{...form.register(
													`variants.${index}.low_stock_threshold`,
												)}
											/>
										</div>
										<div className="flex-1 space-y-2">
											<Label>SKU</Label>
											<Input
												{...form.register(`variants.${index}.sku`)}
												placeholder="Opcional"
											/>
										</div>
										<div className="flex-1 space-y-2">
											<Label>Peso (kg)</Label>
											<Input
												type="number"
												step="0.01"
												{...form.register(`variants.${index}.weight`)}
											/>
										</div>
										<div className="flex-1 space-y-2">
											<Label>Imagen Var.</Label>
											<Input
												{...form.register(
													`variants.${index}.image_url`,
												)}
												placeholder="https://..."
											/>
										</div>
										<div className="flex items-center gap-2 pb-2">
											<Switch
												checked={form.watch(
													`variants.${index}.track_inventory`,
												)}
												onCheckedChange={(checked) =>
													form.setValue(
														`variants.${index}.track_inventory`,
														checked,
													)
												}
											/>
											<Label>Track inv.</Label>
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
