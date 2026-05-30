'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Trash, Plus, AlertTriangle } from 'lucide-react'

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
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/admin/image-upload'
import {
	createProduct,
	updateProduct,
} from '@/lib/actions/products-mutations'
import { deleteStorageObjects } from '@/lib/actions/products-admin'
import { toast } from 'sonner'
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

const formSchema = z
	.object({
		is_customizable: z.boolean().default(false),
		name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
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
					price: optionalNullableNumber,
					stock_quantity: z.coerce.number().min(0),
					// reserved_stock removed from form — managed by the system
					low_stock_threshold: z.coerce.number().min(0),
					sku: z.string().optional().nullable(),
					weight: optionalNullableNumber,
					image_url: optionalNullableUrl,
					track_inventory: z.boolean().default(true),
				}),
			)
			.min(1, 'Agrega al menos una variante (talla/stock)'),
	})
	.superRefine((data, ctx) => {
		if (
			data.compare_at_price != null &&
			data.compare_at_price < data.base_price
		) {
			ctx.addIssue({
				path: ['compare_at_price'],
				code: z.ZodIssueCode.custom,
				message:
					'El precio original debe ser mayor o igual al precio actual.',
			})
		}
	})

type ProductFormValues = z.infer<typeof formSchema>

interface ProductFormProps {
	initialData?: any
	categories: Category[]
	drops: DropOption[]
}

function normalizeImageKey(url: string) {
	try {
		const parsed = new URL(url)
		parsed.search = ''
		parsed.hash = ''
		return parsed.toString()
	} catch {
		return url.trim()
	}
}

function dedupeImages(urls: Array<string | null | undefined>) {
	const uniqueByNormalized = new Map<string, string>()
	for (const url of urls) {
		if (!url) continue
		const trimmed = url.trim()
		if (!trimmed) continue
		const normalized = normalizeImageKey(trimmed)
		if (!uniqueByNormalized.has(normalized)) {
			uniqueByNormalized.set(normalized, trimmed)
		}
	}
	return Array.from(uniqueByNormalized.values())
}

export function ProductForm({
	initialData,
	categories,
	drops,
}: ProductFormProps) {
	const router = useRouter()
	const [loading, setLoading] = useState(false)

	const defaultImages = initialData
		? dedupeImages([
				initialData.main_image,
				...(initialData.images || []),
			])
		: []

	// Track images uploaded this session (for orphan cleanup on abandon)
	const originalImages = useRef(new Set<string>(defaultImages))
	const uploadedThisSession = useRef(new Set<string>())
	const pendingRemovals = useRef(new Set<string>())
	const submittedSuccessfully = useRef(false)

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
									low_stock_threshold: v.low_stock_threshold || 5,
									sku: v.sku || '',
									weight: v.weight ?? null,
									image_url: v.image_url ?? null,
									track_inventory: v.track_inventory ?? true,
								}))
							: [
									{
										size: 'M',
										price: null,
										stock_quantity: 0,
										low_stock_threshold: 5,
										sku: '',
										weight: null,
										image_url: null,
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
							low_stock_threshold: 5,
							sku: '',
							weight: null,
							image_url: null,
							track_inventory: true,
						},
					],
				},
	})

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'variants',
	})

	// P-10: Warn before leaving with unsaved changes
	useEffect(() => {
		const handler = (e: BeforeUnloadEvent) => {
			if (form.formState.isDirty) {
				e.preventDefault()
				e.returnValue = ''
			}
		}
		window.addEventListener('beforeunload', handler)
		return () => window.removeEventListener('beforeunload', handler)
	}, [form.formState.isDirty])

	// P-01: Delete newly uploaded images if the form is abandoned without saving
	useEffect(() => {
		return () => {
			if (submittedSuccessfully.current) return
			const toDelete = [...uploadedThisSession.current].filter(
				(url) => !originalImages.current.has(url),
			)
			if (toDelete.length) {
				void deleteStorageObjects(toDelete)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const watchedVariants = form.watch('variants')
	const watchedStatus = form.watch('status')
	const allVariantsOutOfStock =
		watchedStatus === 'active' &&
		watchedVariants.every((v) => Number(v.stock_quantity || 0) <= 0)

	const onSubmit = async (data: ProductFormValues) => {
		try {
			setLoading(true)
			const normalizedImages = dedupeImages(data.images)

			const payload = {
				...data,
				images: normalizedImages,
				drop_id: data.drop_id === 'none' ? null : data.drop_id,
			}

			let result
			if (initialData) {
				result = await updateProduct(initialData.id, payload)
			} else {
				result = await createProduct(payload)
			}

			if (result.error) {
				toast.error('No se pudo guardar', {
					description: result.message,
				})
			} else {
				submittedSuccessfully.current = true

				// P-02: Delete images removed during this session
				if (pendingRemovals.current.size > 0) {
					void deleteStorageObjects([...pendingRemovals.current])
				}

				toast.success(
					initialData ? 'Producto actualizado' : 'Producto creado',
				)
				router.push('/admin/products')
				router.refresh()
			}
		} catch (error) {
			console.error(error)
			toast.error('Ocurrió un error inesperado')
		} finally {
			setLoading(false)
		}
	}

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit, (errors) => {
				console.error('Validation errors:', errors)
				const missingFields = Object.keys(errors)
					.map((field) => field.replaceAll('_', ' '))
					.join(', ')
				toast.error('Revisa los campos obligatorios', {
					description:
						missingFields ||
						'Verifica que haya al menos una imagen y una variante.',
				})
			})}
			className="space-y-6"
		>
			<div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
				<Card className="xl:col-span-8">
					<CardHeader>
						<CardTitle>Detalles</CardTitle>
						<CardDescription>
							Información principal del producto
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5">
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

						{/* P-04: Hint about product/variant structure */}
						<p className="text-xs text-muted-foreground rounded-md border border-dashed px-3 py-2">
							<strong>Tip:</strong> Un producto agrupa variantes (tallas, colores). No crees un producto por talla — agrégalas como variantes abajo.
						</p>

						<div className="space-y-2">
							<Label>Descripción</Label>
							<Textarea
								{...form.register('description')}
								placeholder="Descripción detallada..."
								className="min-h-28"
							/>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label>Categoría</Label>
								<Select
									onValueChange={(val) =>
										form.setValue('category_id', val, {
											shouldDirty: true,
										})
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

							<div className="space-y-2">
								<Label>Drop (Opcional)</Label>
								<Select
									onValueChange={(val) =>
										form.setValue('drop_id', val, {
											shouldDirty: true,
										})
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
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label>Precio ($)</Label>
								<Input
									type="number"
									step="0.01"
									{...form.register('base_price')}
								/>
							</div>
							<div className="space-y-2">
								{/* P-07: compare_at_price validation feedback */}
								<Label>
									Precio Original (Opcional){' '}
									<span className="text-xs text-muted-foreground font-normal">
										debe ser ≥ precio actual
									</span>
								</Label>
								<Input
									type="number"
									step="0.01"
									{...form.register('compare_at_price')}
								/>
								{form.formState.errors.compare_at_price && (
									<p className="text-red-500 text-sm">
										{form.formState.errors.compare_at_price.message}
									</p>
								)}
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label>Estado</Label>
								<Select
									onValueChange={(val) =>
										form.setValue(
											'status',
											val as 'draft' | 'active' | 'archived',
											{ shouldDirty: true },
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
								{/* P-05: Stock warning in form */}
								{allVariantsOutOfStock && (
									<div className="flex items-center gap-1.5 text-amber-600 text-xs mt-1">
										<AlertTriangle className="h-3.5 w-3.5 shrink-0" />
										<span>
											Todas las variantes tienen stock 0. El producto aparecerá agotado.
										</span>
									</div>
								)}
							</div>

							<div className="flex items-center justify-between rounded-lg border p-3.5">
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
										form.setValue('is_customizable', checked, {
											shouldDirty: true,
										})
									}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="xl:col-span-4">
					<CardHeader>
						<CardTitle>Imágenes</CardTitle>
						<CardDescription>
							La primera imagen será portada
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Label>Galería</Label>
						<div className="rounded-lg border bg-muted/20 p-3">
							<ImageUpload
								value={dedupeImages(form.watch('images') || [])}
								onChange={(urls) =>
									form.setValue('images', dedupeImages(urls), {
										shouldDirty: true,
									})
								}
								onUploaded={(url) =>
									uploadedThisSession.current.add(url)
								}
								onBeforeRemove={(url) =>
									pendingRemovals.current.add(url)
								}
							/>
						</div>
						{form.formState.errors.images && (
							<p className="text-red-500 text-sm">
								{form.formState.errors.images.message}
							</p>
						)}
					</CardContent>
				</Card>

				<Card className="xl:col-span-12">
					<CardHeader className="flex flex-row items-center justify-between gap-3">
						<div>
							<CardTitle>Variantes / Stock</CardTitle>
							<CardDescription>
								Gestiona tallas, precio y stock por variante
							</CardDescription>
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() =>
								append({
									size: '',
									price: null,
									stock_quantity: 0,
									low_stock_threshold: 5,
									sku: '',
									weight: null,
									image_url: null,
									track_inventory: true,
								})
							}
						>
							<Plus className="mr-2 h-4 w-4" /> Agregar Talle
						</Button>
					</CardHeader>
					<CardContent className="space-y-4">
						{fields.map((field, index) => (
							<div
								key={field.id}
								className="rounded-xl border bg-muted/20 p-4"
							>
								<div className="mb-4 flex items-center justify-between">
									<p className="text-sm font-medium">
										Variante {index + 1}
									</p>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										disabled={fields.length === 1}
										onClick={() => remove(index)}
										aria-label={`Eliminar variante ${index + 1}`}
									>
										<Trash className="h-4 w-4 text-red-500" />
									</Button>
								</div>

								<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
									<div className="space-y-2">
										<Label>Talle</Label>
										<Input
											{...form.register(
												`variants.${index}.size`,
											)}
											placeholder="S, M, L..."
										/>
										{form.formState.errors.variants?.[index]
											?.size && (
											<p className="text-red-500 text-xs">
												Requerido
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label>
											Precio Var.{' '}
											<span className="text-xs text-muted-foreground font-normal">
												(vacío = usa precio base)
											</span>
										</Label>
										<Input
											type="number"
											step="0.01"
											{...form.register(
												`variants.${index}.price`,
											)}
										/>
									</div>
									<div className="space-y-2">
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
									{/* P-08: reserved_stock removed — show read-only in edit mode */}
									{initialData && (
										<div className="space-y-2">
											<Label className="text-muted-foreground">
												Reservado{' '}
												<span className="text-xs font-normal">
													(sist.)
												</span>
											</Label>
											<Input
												type="number"
												value={
													initialData.variants?.[index]
														?.reserved_stock ?? 0
												}
												readOnly
												disabled
												className="bg-muted/40"
											/>
										</div>
									)}
									<div className="space-y-2">
										<Label>Umbral Bajo</Label>
										<Input
											type="number"
											{...form.register(
												`variants.${index}.low_stock_threshold`,
											)}
										/>
									</div>
									<div className="space-y-2">
										<Label>SKU</Label>
										<Input
											{...form.register(
												`variants.${index}.sku`,
											)}
											placeholder="Opcional"
										/>
									</div>
									<div className="space-y-2">
										<Label>Peso (kg)</Label>
										<Input
											type="number"
											step="0.01"
											{...form.register(
												`variants.${index}.weight`,
											)}
										/>
									</div>
								</div>

								{/* P-03: Replace text input with ImageUpload for variant image */}
								<div className="mt-4 space-y-2">
									<Label>
										Imagen de variante{' '}
										<span className="text-xs text-muted-foreground font-normal">
											(opcional — hereda imagen del producto)
										</span>
									</Label>
									<ImageUpload
										value={
											form.watch(
												`variants.${index}.image_url`,
											)
												? [
														form.watch(
															`variants.${index}.image_url`,
														) as string,
													]
												: []
										}
										onChange={(urls) =>
											form.setValue(
												`variants.${index}.image_url`,
												urls[0] ?? null,
												{ shouldDirty: true },
											)
										}
										onUploaded={(url) =>
											uploadedThisSession.current.add(url)
										}
										onBeforeRemove={(url) =>
											pendingRemovals.current.add(url)
										}
										maxImages={1}
									/>
								</div>

								<div className="mt-4 flex items-center gap-2 rounded-md border bg-background p-3">
									<Switch
										checked={form.watch(
											`variants.${index}.track_inventory`,
										)}
										onCheckedChange={(checked) =>
											form.setValue(
												`variants.${index}.track_inventory`,
												checked,
												{ shouldDirty: true },
											)
										}
									/>
									<Label>Track inv.</Label>
								</div>
							</div>
						))}
						{form.formState.errors.variants && (
							<p className="text-red-500 text-sm">
								{form.formState.errors.variants.message}
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			<div className="flex justify-end">
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
			</div>
		</form>
	)
}
