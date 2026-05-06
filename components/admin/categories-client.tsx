'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Edit, MoreHorizontal, Plus, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Category } from '@/lib/services/categories-server'
import { deleteCategory } from '@/lib/actions/categories-mutations'
import { toast } from 'sonner'

interface CategoriesClientProps {
	data: Category[]
}

export function CategoriesClient({ data }: CategoriesClientProps) {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [pendingDelete, setPendingDelete] = useState<Category | null>(null)

	const handleDelete = async (id: string) => {
		if (loading) return

		try {
			setLoading(true)
			const result = await deleteCategory(id)
			if (result.error) {
				toast.error('Error', {
					description: result.message,
				})
			} else {
				toast.success('Eliminado', {
					description: result.message,
				})
				setPendingDelete(null)
				router.refresh()
			}
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">
						Categorías ({data.length})
					</h2>
					<p className="text-sm text-muted-foreground">
						Gestiona las categorías de tus productos
					</p>
				</div>
				<Button
					onClick={() => router.push('/admin/categories/new')}
					aria-label="Crear nueva categoria"
				>
					<Plus className="mr-2 h-4 w-4" /> Nueva Categoría
				</Button>
			</div>

			<ConfirmDialog
				open={Boolean(pendingDelete)}
				onOpenChange={(open) => {
					if (!open) setPendingDelete(null)
				}}
				title="Eliminar categoría"
				description={
					pendingDelete
						? `Se eliminará la categoría ${pendingDelete.name}.`
						: 'Se eliminará la categoría seleccionada.'
				}
				onConfirm={() => {
					if (pendingDelete) {
						void handleDelete(pendingDelete.id)
					}
				}}
				confirmLabel="Eliminar"
				loadingLabel="Eliminando..."
				loading={loading}
			/>

			<div
				className="rounded-md border bg-white shadow-sm"
				aria-busy={loading}
			>
				<Table>
					<caption className="sr-only">
						Tabla de categorias del catalogo administrable
					</caption>
					<TableHeader>
						<TableRow>
							<TableHead>Nombre</TableHead>
							<TableHead>Slug</TableHead>
							<TableHead>Descripción</TableHead>
							<TableHead className="w-24">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((category) => (
							<TableRow
								key={category.id}
								className="hover:bg-muted/30"
							>
								<TableCell className="font-medium">
									<div className="flex items-center gap-3">
										{category.image_url && (
											<div className="h-10 w-10 relative overflow-hidden rounded-md border">
												<Image
													src={category.image_url}
													alt={`Imagen de categoria ${category.name}`}
													fill
													className="object-cover"
												/>
											</div>
										)}
										{category.name}
									</div>
								</TableCell>
								<TableCell>{category.slug}</TableCell>
								<TableCell className="max-w-xs truncate">
									{category.description || 'Sin descripcion'}
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												className="h-8 w-8 p-0"
												disabled={loading}
												aria-label={`Abrir acciones para categoria ${category.name}`}
											>
												<span className="sr-only">Abrir menu</span>
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>Acciones</DropdownMenuLabel>
											<DropdownMenuItem
												disabled={loading}
												onClick={() =>
													router.push(
														`/admin/categories/${category.id}`,
													)
												}
											>
												<Edit className="mr-2 h-4 w-4" /> Editar
											</DropdownMenuItem>
											<DropdownMenuItem
												disabled={loading}
												className="text-red-600"
												onClick={() => setPendingDelete(category)}
											>
												<Trash className="mr-2 h-4 w-4" /> Eliminar
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
						{data.length === 0 && (
							<TableRow>
								<TableCell colSpan={4} className="h-24 text-center">
									No hay categorías.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
