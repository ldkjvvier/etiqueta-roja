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
import { Eye } from 'lucide-react'

type TopProduct = {
	id: string
	name: string
	price: number
	image: string
	views?: number
}

export function TopProducts({
	products,
}: {
	products: TopProduct[]
}) {
	if (products.length === 0) return null

	return (
		<Card className="col-span-4 lg:col-span-3">
			<CardHeader>
				<CardTitle>Más Vistos</CardTitle>
				<CardDescription>
					Productos con mayor número de visitas.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-20"></TableHead>
							<TableHead>Nombre</TableHead>
							<TableHead className="text-right">Vistas</TableHead>
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
											{formatPrice(product.price)}
										</span>
									</div>
								</TableCell>
								<TableCell className="text-right font-bold">
									<div className="flex items-center justify-end gap-2">
										<Eye className="h-4 w-4 text-muted-foreground" />
										{product.views || 0}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}
