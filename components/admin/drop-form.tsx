'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader2, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { ImageUpload } from '@/components/admin/image-upload'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import {
	createDrop,
	deleteDrop,
	updateDrop,
} from '@/lib/actions/drops-admin'
import { AdminDrop } from '@/lib/data/drops'
import { toast } from 'sonner'

const formSchema = z
	.object({
		name: z
			.string()
			.min(2, 'El nombre debe tener al menos 2 caracteres'),
		slug: z.string().optional(),
		description: z.string().optional(),
		cover_image: z.string().optional(),
		status: z.enum(['scheduled', 'live', 'ended']),
		start_time: z.string().min(1, 'Debes definir fecha de inicio'),
		end_time: z.string().optional(),
	})
	.superRefine((value, ctx) => {
		if (!value.end_time) return

		const start = new Date(value.start_time)
		const end = new Date(value.end_time)

		if (
			Number.isNaN(start.getTime()) ||
			Number.isNaN(end.getTime())
		) {
			return
		}

		if (end <= start) {
			ctx.addIssue({
				path: ['end_time'],
				code: z.ZodIssueCode.custom,
				message: 'La fecha de fin debe ser posterior al inicio',
			})
		}
	})

type DropFormValues = z.infer<typeof formSchema>

interface DropFormProps {
	initialData?: AdminDrop | null
}

function toDateTimeLocal(value?: string | null) {
	if (!value) return ''
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return ''

	const local = new Date(
		date.getTime() - date.getTimezoneOffset() * 60000,
	)
	return local.toISOString().slice(0, 16)
}

export function DropForm({ initialData }: DropFormProps) {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

	const title = initialData ? 'Editar Drop' : 'Nuevo Drop'
	const description = initialData
		? 'Actualiza la configuración del lanzamiento'
		: 'Crea un nuevo lanzamiento para agrupar productos'
	const action = initialData ? 'Guardar cambios' : 'Crear drop'

	const form = useForm<DropFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: initialData
			? {
					name: initialData.name,
					slug: initialData.slug,
					description: initialData.description || '',
					cover_image: initialData.cover_image || '',
					status: initialData.status || 'scheduled',
					start_time: toDateTimeLocal(initialData.start_time),
					end_time: toDateTimeLocal(initialData.end_time),
				}
			: {
					name: '',
					slug: '',
					description: '',
					cover_image: '',
					status: 'scheduled',
					start_time: '',
					end_time: '',
				},
	})

	const onSubmit = async (data: DropFormValues) => {
		try {
			setLoading(true)

			const payload = {
				...data,
				slug: data.slug || undefined,
				description: data.description || null,
				cover_image: data.cover_image || null,
				end_time: data.end_time || null,
			}

			const result = initialData
				? await updateDrop(initialData.id, payload)
				: await createDrop(payload)

			if (result.error) {
				toast.error('Error', {
					description: result.message,
				})
				return
			}

			toast.success(
				initialData ? 'Drop actualizado' : 'Drop creado',
				{
					description: result.message,
				},
			)
			router.push('/admin/drops')
			router.refresh()
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Error desconocido'
			console.error('[DropForm.onSubmit]', error)
			toast.error('Error', { description: message })
		} finally {
			setLoading(false)
		}
	}

	const onDelete = async () => {
		if (!initialData) return

		try {
			setLoading(true)
			const result = await deleteDrop(initialData.id)
			if (result.error) {
				toast.error('Error', { description: result.message })
				return
			}

			toast.success('Drop eliminado', {
				description: result.message,
			})
			setIsDeleteDialogOpen(false)
			router.push('/admin/drops')
			router.refresh()
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Error desconocido'
			console.error('[DropForm.onDelete]', error)
			toast.error('Error', { description: message })
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">
						{title}
					</h2>
					<p className="text-sm text-muted-foreground">
						{description}
					</p>
				</div>
				{initialData && (
					<Button
						disabled={loading}
						variant="destructive"
						size="icon"
						onClick={() => setIsDeleteDialogOpen(true)}
						aria-label="Eliminar drop"
					>
						<Trash className="h-4 w-4" />
					</Button>
				)}
			</div>

			<Separator />

			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-8"
			>
				<div className="grid gap-8 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Detalles</CardTitle>
							<CardDescription>
								Configuración principal del lanzamiento
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label>Nombre</Label>
								<Input
									disabled={loading}
									placeholder="Ej: Summer 2026"
									{...form.register('name')}
								/>
								{form.formState.errors.name && (
									<p className="text-red-500 text-sm">
										{form.formState.errors.name.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label>Slug (Opcional)</Label>
								<Input
									disabled={loading}
									placeholder="summer-2026"
									{...form.register('slug')}
								/>
							</div>

							<div className="space-y-2">
								<Label>Descripción</Label>
								<Textarea
									disabled={loading}
									placeholder="Describe este drop..."
									{...form.register('description')}
								/>
							</div>

							<div className="space-y-2">
								<Label>Estado</Label>
								<Select
									onValueChange={(value) =>
										form.setValue(
											'status',
											value as 'scheduled' | 'live' | 'ended',
										)
									}
									defaultValue={form.getValues('status')}
								>
									<SelectTrigger>
										<SelectValue placeholder="Seleccionar estado" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="scheduled">
											Programado
										</SelectItem>
										<SelectItem value="live">Live</SelectItem>
										<SelectItem value="ended">Finalizado</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
								<div className="space-y-2">
									<Label>Inicio</Label>
									<Input
										type="datetime-local"
										disabled={loading}
										{...form.register('start_time')}
									/>
									{form.formState.errors.start_time && (
										<p className="text-red-500 text-sm">
											{form.formState.errors.start_time.message}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label>Fin (Opcional)</Label>
									<Input
										type="datetime-local"
										disabled={loading}
										{...form.register('end_time')}
									/>
									{form.formState.errors.end_time && (
										<p className="text-red-500 text-sm">
											{form.formState.errors.end_time.message}
										</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Portada</CardTitle>
							<CardDescription>
								Imagen principal del drop (opcional)
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ImageUpload
								value={
									form.watch('cover_image')
										? [form.watch('cover_image')!]
										: []
								}
								onChange={(urls) =>
									form.setValue('cover_image', urls[0] || '')
								}
								maxImages={1}
							/>
						</CardContent>
					</Card>
				</div>

				<div className="flex justify-end">
					<Button disabled={loading} type="submit">
						{loading && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						{action}
					</Button>
				</div>
			</form>

			<ConfirmDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				title="Eliminar drop"
				description="Esta acción eliminará el drop seleccionado del panel."
				onConfirm={onDelete}
				confirmLabel="Eliminar"
				loadingLabel="Eliminando..."
				loading={loading}
			/>
		</div>
	)
}
