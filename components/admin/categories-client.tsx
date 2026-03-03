'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Edit, MoreHorizontal, Plus, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Category } from '@/lib/services/categories-server'
import { deleteCategory } from '@/lib/actions/categories-mutations'
import { toast } from 'sonner'

interface CategoriesClientProps {
	data: Category[]
}

export function CategoriesClient({ data }: CategoriesClientProps) {
	const router = useRouter()
	const [loading, setLoading] = useState(false)

	const handleDelete = async (id: string) => {
		if (!confirm('¿Estás seguro de eliminar esta categoría?')) return

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
				<Button onClick={() => router.push('/admin/categories/new')}>
					<Plus className="mr-2 h-4 w-4" /> Nueva Categoría
				</Button>
			</div>

			<div className="border rounded-md">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nombre</TableHead>
							<TableHead>Slug</TableHead>
							<TableHead>Descripción</TableHead>
							<TableHead className="w-25">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((category) => (
							<TableRow key={category.id}>
								<TableCell className="font-medium">
									<div className="flex items-center gap-3">
										{category.image_url && (
											<div className="h-10 w-10 relative overflow-hidden rounded-md border">
												<Image
													src={category.image_url}
													alt={category.name}
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
									{category.description}
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" className="h-8 w-8 p-0">
												<span className="sr-only">Abrir menu</span>
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>Acciones</DropdownMenuLabel>
											<DropdownMenuItem
												onClick={() =>
													router.push(
														`/admin/categories/${category.id}`,
													)
												}
											>
												<Edit className="mr-2 h-4 w-4" /> Editar
											</DropdownMenuItem>
											<DropdownMenuItem
												className="text-red-600"
												onClick={() => handleDelete(category.id)}
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
