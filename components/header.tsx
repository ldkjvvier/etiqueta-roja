'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Menu, X, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTrigger,
	SheetTitle,
} from '@/components/ui/sheet'
import { useStore } from '@/lib/store-context'
import { CartSheet } from './cart-sheet'
import { cn } from '@/lib/utils'

const navLinks = [
	{ label: 'INICIO', href: '/' },
	{ label: 'STOCK', href: '/#stock' },
	{ label: 'CONTACTO', href: '/#contacto' },
]

function Logo({ compact }: { compact?: boolean }) {
	return (
		<span
			className={cn(
				'font-black tracking-tighter text-foreground transition-all duration-300',
				compact ? 'text-lg md:text-xl' : 'text-xl md:text-2xl',
			)}
		>
			ETIQUETA{' '}
			<span className="ml-1">
				R
				<Star
					className={cn(
						'inline-block fill-primary text-primary ml-[0.1rem] -mt-1 transition-all duration-300',
						compact
							? 'w-3.5 h-3.5 md:w-4 md:h-4'
							: 'w-4 h-4 md:w-5 md:h-5',
					)}
				/>
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

	const [scrolled, setScrolled] = useState(false)

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 60)
		onScroll()
		window.addEventListener('scroll', onScroll, { passive: true })
		return () => window.removeEventListener('scroll', onScroll)
	}, [])

	return (
		<header
			className={cn(
				'sticky top-0 z-50 w-full transition-all duration-300',
				scrolled
					? 'bg-background/95 backdrop-blur-md border-b border-border'
					: 'bg-background border-b border-transparent',
			)}
		>
			<div className="container mx-auto px-4">
				<div
					className={cn(
						'grid grid-cols-3 items-center transition-all duration-300',
						scrolled ? 'h-14' : 'h-16 md:h-20',
					)}
				>
					{/* LEFT — Mobile: hamburger | Desktop: nav links */}
					<div className="flex items-center justify-start">
						{/* Mobile hamburger */}
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
										className="-ml-2 hover:bg-transparent hover:text-primary active:scale-[0.97]"
										aria-label="Abrir menú"
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
										{/* Menu top bar */}
										<div className="flex items-center justify-between px-6 py-5 border-b border-border">
											<SheetTitle asChild>
												<Link
													href="/"
													onClick={() => setIsMobileMenuOpen(false)}
													aria-label="Ir al inicio"
												>
													<Logo />
												</Link>
											</SheetTitle>
											<SheetDescription className="sr-only">
												Menú principal de navegación con accesos a
												inicio, stock y contacto.
											</SheetDescription>
											<Button
												variant="ghost"
												size="icon"
												type="button"
												aria-label="Cerrar menú"
												onClick={() => setIsMobileMenuOpen(false)}
												className="-mr-2 hover:bg-transparent hover:text-primary active:scale-[0.97]"
											>
												<X className="h-6 w-6" />
												<span className="sr-only">Cerrar menú</span>
											</Button>
										</div>

										{/* Nav links — editorial, large */}
										<nav
											className="flex flex-col px-6 pt-6"
											aria-label="Menú principal"
										>
											{navLinks.map((link) => (
												<Link
													key={link.label}
													href={link.href}
													onClick={() => setIsMobileMenuOpen(false)}
													className="group flex items-center justify-between py-5 border-b border-border hover:text-primary transition-colors duration-150"
												>
													<span className="text-[2.75rem] font-black tracking-tight leading-none">
														{link.label}
													</span>
													<ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-150" />
												</Link>
											))}
										</nav>

										{/* Bottom CTA — cart shortcut */}
										<div className="mt-auto px-6 pb-10 pt-6">
											<Button
												type="button"
												variant="outline"
												className="w-full h-12 font-bold text-sm tracking-widest uppercase border-2 border-foreground hover:bg-foreground hover:text-background transition-colors duration-150"
												onClick={() => {
													setIsMobileMenuOpen(false)
													setIsCartOpen(true)
												}}
											>
												<ShoppingBag className="h-4 w-4 mr-2 shrink-0" />
												Ver carrito
												{cartCount > 0 && (
													<span
														aria-hidden="true"
														className="ml-2 bg-primary text-primary-foreground text-[11px] font-black px-2 py-0.5 leading-none"
													>
														{cartCount}
													</span>
												)}
											</Button>
										</div>
									</div>
								</SheetContent>
							</Sheet>
						</div>

						{/* Desktop nav */}
						<nav
							className="hidden md:flex items-center gap-8"
							aria-label="Navegación principal"
						>
							{navLinks.map((link) => (
								<Link
									key={link.label}
									href={link.href}
									title={link.label}
									className="relative text-sm font-bold tracking-widest py-1 group"
								>
									{link.label}
									<span
										aria-hidden="true"
										className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-200 ease-out group-hover:w-full"
									/>
								</Link>
							))}
						</nav>
					</div>

					{/* CENTER — Logo (both mobile and desktop) */}
					<div className="flex justify-center">
						<Link
							href="/"
							aria-label="Ir al inicio — ETIQUETA ROJA"
							className="flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
						>
							<Logo compact={scrolled} />
						</Link>
					</div>

					{/* RIGHT — Cart */}
					<div className="flex items-center justify-end">
						{/* Mobile: icon-only */}
						<Button
							variant="ghost"
							size="icon"
							type="button"
							className="relative md:hidden hover:bg-transparent hover:text-primary active:scale-[0.97]"
							onClick={() => setIsCartOpen(true)}
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
									className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-black w-[18px] h-[18px] flex items-center justify-center"
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
							className="hidden md:inline-flex items-center gap-2 font-bold text-sm tracking-widest hover:bg-transparent hover:text-primary active:scale-[0.97] transition-colors"
							onClick={() => setIsCartOpen(true)}
							aria-label={
								cartCount > 0
									? `Abrir carrito (${cartCount} artículos)`
									: 'Abrir carrito'
							}
							aria-haspopup="dialog"
							aria-expanded={isCartOpen}
							aria-controls="cart-sheet"
						>
							<ShoppingBag className="h-[18px] w-[18px] shrink-0" />
							<span className="uppercase">Carrito</span>
							{cartCount > 0 && (
								<span
									aria-hidden="true"
									className="bg-primary text-primary-foreground text-[11px] font-black px-1.5 py-0.5 leading-none"
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
