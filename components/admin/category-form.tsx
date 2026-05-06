'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader2, Save, Trash } from 'lucide-react'

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
import { ImageUpload } from '@/components/admin/image-upload'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import {
	createCategory,
	updateCategory,
	deleteCategory,
} from '@/lib/actions/categories-mutations'
import { toast } from 'sonner'
import { Category } from '@/lib/services/categories-server'

const formSchema = z.object({
	name: z
		.string()
		.min(2, 'El nombre debe tener al menos 2 caracteres'),
	slug: z.string().optional(),
	description: z.string().optional(),
	image: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof formSchema>

interface CategoryFormProps {
	initialData?: Category | null
}

export function CategoryForm({ initialData }: CategoryFormProps) {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

	const title = initialData ? 'Editar Categoría' : 'Nueva Categoría'
	const description = initialData
		? 'Editar los detalles de la categoría'
		: 'Agregar una nueva categoría'
	const action = initialData ? 'Guardar cambios' : 'Crear categoría'

	const form = useForm<CategoryFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: initialData
			? {
					name: initialData.name,
					slug: initialData.slug,
					description: initialData.description || '',
					image: initialData.image_url || '',
				}
			: {
					name: '',
					slug: '',
					description: '',
					image: '',
				},
	})

	const onSubmit = async (data: CategoryFormValues) => {
		try {
			setLoading(true)

			let result
			if (initialData) {
				result = await updateCategory(initialData.id, data)
			} else {
				result = await createCategory(data)
			}

			if (result.error) {
				toast.error('Error', {
					description: result.message,
				})
			} else {
				toast.success('Exito', {
					description: result.message,
				})
				router.push('/admin/categories')
				router.refresh()
			}
		} catch (error) {
			toast.error('Error', {
				description: 'Algo salió mal.',
			})
		} finally {
			setLoading(false)
		}
	}

	const onDelete = async () => {
		if (!initialData) return

		try {
			setLoading(true)
			const result = await deleteCategory(initialData.id)
			if (result.error) {
				toast.error('Error', { description: result.message })
			} else {
				toast.success('Eliminado', { description: result.message })
				setIsDeleteDialogOpen(false)
				router.push('/admin/categories')
				router.refresh()
			}
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
						aria-label="Eliminar categoría"
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
								Información básica de la categoría
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label>Nombre</Label>
								<Input
									disabled={loading}
									placeholder="Ej: Remeras"
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
									placeholder="ej-remeras"
									{...form.register('slug')}
								/>
								<p className="text-xs text-muted-foreground">
									Se generará automáticamente si se deja vacío.
								</p>
							</div>
							<div className="space-y-2">
								<Label>Descripción</Label>
								<Textarea
									disabled={loading}
									placeholder="Descripción de la categoría..."
									{...form.register('description')}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Imagen</CardTitle>
							<CardDescription>
								Imagen representativa (Opcional)
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ImageUpload
								value={
									form.watch('image') ? [form.watch('image')!] : []
								}
								onChange={(urls) =>
									form.setValue('image', urls[0] || '')
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
				title="Eliminar categoría"
				description="Esta acción eliminará la categoría seleccionada del panel administrativo."
				onConfirm={onDelete}
				confirmLabel="Eliminar"
				loadingLabel="Eliminando..."
				loading={loading}
			/>
		</div>
	)
}
