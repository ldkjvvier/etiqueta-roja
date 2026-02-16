'use client'

import { ShoppingBag, Menu, X, Star } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetTitle,
} from '@/components/ui/sheet'
import { useStore } from '@/lib/store-context'
import { CartSheet } from './cart-sheet'

const navLinks = [
	{ label: 'INICIO', href: '/' },
	// Using absolute paths for anchors to ensure they work from other pages
	{ label: 'OFERTAS', href: '/#ofertas' },
	{ label: 'PEDIDOS', href: '/#pedidos' },
	{ label: 'STOCK', href: '/#stock' },
]

function Logo() {
	return (
		<span className="text-xl md:text-2xl font-black tracking-tighter text-foreground">
			ETIQUETA{' '}
			<span className="ml-1">
				R
				<Star className="inline-block w-4 h-4 md:w-5 md:h-5 fill-primary text-primary ml-[0.1rem] -mt-1" />
				JA
			</span>
		</span>
	)
}

export function Header() {
	const {
		cartCount,
		isCartOpen,
		setIsCartOpen,
		isMobileMenuOpen,
		setIsMobileMenuOpen,
	} = useStore()

	return (
		<header className="sticky top-0 z-50 bg-background border-b border-border">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16 md:h-20">
					{/* Mobile Menu */}
					<div className="md:hidden">
						<Sheet
							open={isMobileMenuOpen}
							onOpenChange={setIsMobileMenuOpen}
						>
							<SheetTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									type="button"
									className="hover:bg-transparent hover:text-primary active:scale-[0.98]"
									aria-label="Abrir menú"
									title="Abrir menú"
								>
									<Menu className="h-6 w-6" />
									<span className="sr-only">Abrir menú</span>
								</Button>
							</SheetTrigger>
							<SheetContent
								side="left"
								className="w-full bg-background border-none p-0 [&>button]:hidden"
							>
								<div className="flex flex-col h-full">
									<div className="flex items-center justify-between p-6 border-b border-border">
										<SheetTitle>
											<Logo />
										</SheetTitle>
										<Button
											variant="ghost"
											size="icon"
											type="button"
											aria-label="Cerrar menú"
											title="Cerrar menú"
											onClick={() => setIsMobileMenuOpen(false)}
											className="hover:bg-transparent hover:text-primary active:scale-[0.98]"
										>
											<X className="h-6 w-6" />
										</Button>
									</div>
									<nav className="flex flex-col p-6 gap-2">
										{navLinks.map((link) => (
											<Link
												key={link.label}
												href={link.href}
												onClick={() => setIsMobileMenuOpen(false)}
												className="text-4xl font-black tracking-tight py-4 border-b border-border hover:text-primary transition-colors"
											>
												{link.label}
											</Link>
										))}
									</nav>
								</div>
							</SheetContent>
						</Sheet>
					</div>

					{/* Logo */}
					<Link
						href="/"
						className="flex items-center"
						aria-label="Ir al inicio"
						title="Ir al inicio"
					>
						<Logo />
					</Link>

					{/* Desktop Nav */}
					<nav
						className="hidden md:flex items-center gap-8"
						aria-label="Navegación principal"
					>
						{navLinks.map((link) => (
							<Link
								key={link.label}
								href={link.href}
								className="text-sm font-bold tracking-wide hover:text-primary transition-colors"
								title={link.label}
							>
								{link.label}
							</Link>
						))}
					</nav>

					{/* Actions */}
					<div className="flex items-center gap-2">
						{/* Mobile: icon-only */}
						<Button
							variant="ghost"
							size="icon"
							type="button"
							className="relative md:hidden hover:bg-transparent hover:text-primary active:scale-[0.98]"
							onClick={() => setIsCartOpen(true)}
							title={
								cartCount > 0
									? `Abrir carrito (${cartCount} artículos)`
									: 'Abrir carrito'
							}
							aria-label={
								cartCount > 0
									? `Abrir carrito (${cartCount} artículos)`
									: 'Abrir carrito'
							}
							aria-haspopup="dialog"
							aria-expanded={isCartOpen}
							aria-controls="cart-sheet"
						>
							<ShoppingBag className="h-5 w-5" />
							{cartCount > 0 && (
								<span
									aria-hidden="true"
									className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center"
								>
									{cartCount}
								</span>
							)}
							<span className="sr-only">
								Carrito
								{cartCount > 0 ? `, ${cartCount} artículos` : ''}
							</span>
						</Button>

						{/* Desktop: icon + label + count */}
						<Button
							variant="ghost"
							size="sm"
							type="button"
							className="hidden md:inline-flex font-bold hover:bg-transparent hover:text-primary active:scale-[0.98]"
							onClick={() => setIsCartOpen(true)}
							title={
								cartCount > 0
									? `Abrir carrito (${cartCount} artículos)`
									: 'Abrir carrito'
							}
							aria-label={
								cartCount > 0
									? `Abrir carrito (${cartCount} artículos)`
									: 'Abrir carrito'
							}
							aria-haspopup="dialog"
							aria-expanded={isCartOpen}
							aria-controls="cart-sheet"
						>
							<ShoppingBag className="h-5 w-5" />
							<span className="uppercase tracking-wide">Carrito</span>
							{cartCount > 0 && (
								<span
									aria-hidden="true"
									className="ml-1 bg-primary text-primary-foreground text-xs font-black px-2 py-0.5"
								>
									{cartCount}
								</span>
							)}
						</Button>
					</div>
				</div>
			</div>

			{/* Cart Sheet */}
			<CartSheet />
		</header>
	)
}
