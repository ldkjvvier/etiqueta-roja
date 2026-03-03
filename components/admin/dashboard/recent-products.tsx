'use client'

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

// Define a minimal type for recent products
type RecentProduct = {
	id: string
	name: string
	price: number
	image: string
	created_at: string
}

export function RecentProducts({
	products,
}: {
	products: RecentProduct[]
}) {
	return (
		<Card className="col-span-4 lg:col-span-3">
			<CardHeader className="flex flex-row items-center">
				<div className="grid gap-2">
					<CardTitle>Productos Recientes</CardTitle>
					<CardDescription>
						Recientemente agregados a la tienda.
					</CardDescription>
				</div>
				<div className="ml-auto font-medium">
					<Link
						href="/admin/products"
						className="flex items-center text-sm text-primary hover:underline"
					>
						Ver todos <ArrowUpRight className="ml-1 h-4 w-4" />
					</Link>
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-20"></TableHead>
							<TableHead>Nombre</TableHead>
							<TableHead className="text-right">Precio</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{products.map((product) => (
							<TableRow key={product.id}>
								<TableCell>
									<div className="relative h-10 w-10 overflow-hidden rounded-md border">
										<Image
											src={product.image || '/placeholder.svg'}
											alt={product.name}
											fill
											className="object-cover"
										/>
									</div>
								</TableCell>
								<TableCell className="font-medium">
									<div className="flex flex-col">
										<span>{product.name}</span>
										<span className="text-xs text-muted-foreground">
											{new Date(
												product.created_at,
											).toLocaleDateString('es-CL')}
										</span>
									</div>
								</TableCell>
								<TableCell className="text-right">
									{formatPrice(product.price)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}
