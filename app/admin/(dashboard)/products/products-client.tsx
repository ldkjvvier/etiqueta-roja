'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
	MoreHorizontal,
	Plus,
	Search,
	Trash,
	Edit,
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

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
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { deleteProduct } from '@/lib/actions/products'
import type { AdminProduct } from '@/lib/services/products-admin'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

interface ProductTableProps {
	products: AdminProduct[]
	totalCount: number
	currentPage: number
	totalPages: number
	search: string
}

export function ProductTable({
	products,
	totalCount,
	currentPage,
	totalPages,
	search,
}: ProductTableProps) {
	const router = useRouter()
	const pathname = usePathname()
	const [searchTerm, setSearchTerm] = useState(search)
	const [pendingDelete, setPendingDelete] = useState<AdminProduct | null>(
		null,
	)

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			handleSearch(searchTerm)
		}, 350)

		return () => clearTimeout(timeoutId)
	}, [searchTerm])

	// Search Handler
	const handleSearch = (term: string) => {
		const params = new URLSearchParams(window.location.search)
		if (term) {
			params.set('q', term)
		} else {
			params.delete('q')
		}
		params.set('page', '1') // Reset to page 1
		router.replace(`${pathname}?${params.toString()}`)
	}

	// Pagination Handler
	const handlePageChange = (newPage: number) => {
		const params = new URLSearchParams(window.location.search)
		params.set('page', newPage.toString())
		router.push(`${pathname}?${params.toString()}`)
	}

	// Delete Handler
	const handleDelete = async (id: string) => {
		const result = await deleteProduct(id)
		if (result.error) {
			toast.error('No se pudo eliminar', {
				description: result.message,
			})
			return
		}

		toast.success('Producto eliminado', {
			description: result.message,
		})
		setPendingDelete(null)
		router.refresh()
	}

	return (
		<div className="space-y-4">
			{/* Toolbar */}
			<div className="flex items-center justify-between gap-4">
				<div className="relative max-w-sm flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Buscar productos..."
						className="pl-8"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						aria-label="Buscar productos"
					/>
				</div>
				<Button onClick={() => router.push('/admin/products/new')}>
					<Plus className="mr-2 h-4 w-4" /> Agregar Producto
				</Button>
			</div>

			{/* Table */}
			<div className="rounded-md border bg-white">
				<Table>
					<caption className="sr-only">
						Tabla de productos administrables
					</caption>
					<TableHeader>
						<TableRow>
							<TableHead className="w-20 hidden md:table-cell">
								Imagen
							</TableHead>
							<TableHead>Nombre</TableHead>
							<TableHead className="hidden md:table-cell">
								Categoría
							</TableHead>
							<TableHead>Precio</TableHead>
							<TableHead className="hidden lg:table-cell">
								Estado
							</TableHead>
							<TableHead className="hidden md:table-cell">
								Stock
							</TableHead>
							<TableHead className="text-right">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{products.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center">
									No se encontraron productos.
								</TableCell>
							</TableRow>
						) : (
							products.map((product) => (
								<TableRow key={product.id}>
									<TableCell className="hidden md:table-cell">
										<div className="relative h-12 w-12 overflow-hidden rounded-md border">
											<Image
												src={product.main_image}
												alt={product.name}
												fill
												className="object-cover"
											/>
										</div>
									</TableCell>
									<TableCell className="font-medium">
										{product.name}
										<div className="md:hidden text-xs text-muted-foreground mt-1">
											{product.available_stock} disponibles
										</div>
									</TableCell>
									<TableCell className="hidden md:table-cell">
										<Badge variant="outline" className="font-mono">
											{product.category_name || 'Sin Categoría'}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex flex-col">
											<span>{formatPrice(product.base_price)}</span>
											{product.compare_at_price && (
												<span className="text-xs text-muted-foreground line-through">
													{formatPrice(product.compare_at_price)}
												</span>
											)}
										</div>
									</TableCell>
									<TableCell className="hidden lg:table-cell">
										<Badge variant="outline">{product.status}</Badge>
									</TableCell>
									<TableCell className="hidden md:table-cell">
										{product.available_stock === 0 ? (
											<Badge variant="destructive">Agotado</Badge>
										) : product.low_stock_alert ? (
											<Badge
												variant="secondary"
												className="text-orange-600 border-orange-200 bg-orange-50"
											>
												Bajo: {product.available_stock}
											</Badge>
										) : (
											<span className="text-sm">
												{product.available_stock} disp. /{' '}
												{product.reserved_stock} res.
											</span>
										)}
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													className="h-8 w-8 p-0"
													aria-label={`Abrir acciones para ${product.name}`}
												>
													<span className="sr-only">Abrir menú</span>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>
													Acciones
												</DropdownMenuLabel>
												<DropdownMenuItem
													onClick={() =>
														router.push(
															`/admin/products/${product.id}`,
														)
													}
												>
													<Edit className="mr-2 h-4 w-4" /> Editar
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive focus:text-destructive"
													onClick={() => setPendingDelete(product)}
												>
													<Trash className="mr-2 h-4 w-4" /> Eliminar
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<ConfirmDialog
				open={Boolean(pendingDelete)}
				onOpenChange={(open) => {
					if (!open) setPendingDelete(null)
				}}
				title="Eliminar producto"
				description={
					pendingDelete
						? `Se eliminará el producto ${pendingDelete.name} de forma permanente.`
						: 'Se eliminará el producto seleccionado de forma permanente.'
				}
				onConfirm={() => {
					if (pendingDelete) {
						void handleDelete(pendingDelete.id)
					}
				}}
				confirmLabel="Eliminar"
				loadingLabel="Eliminando..."
			/>

			{/* Footer / Pagination */}
			<div className="flex items-center justify-between px-2">
				<div className="text-sm text-muted-foreground hidden md:block">
					Mostrando {(currentPage - 1) * 10 + 1} a{' '}
					{Math.min(currentPage * 10, totalCount)} de {totalCount}{' '}
					productos
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage <= 1}
					>
						Anterior
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage >= totalPages}
					>
						Siguiente
					</Button>
				</div>
			</div>
		</div>
	)
}
