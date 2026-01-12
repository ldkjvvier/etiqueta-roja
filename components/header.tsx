"use client"

import { Search, ShoppingBag, Menu, X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useStore } from "@/lib/store-context"
import { CartSheet } from "./cart-sheet"

const navLinks = [
  { label: "INICIO", href: "#" },
  { label: "OFERTAS", href: "#ofertas" },
  { label: "PEDIDOS", href: "#pedidos" },
  { label: "STOCK", href: "#stock" },
]

function Logo() {
  return (
    <span className="text-xl md:text-2xl font-black tracking-tighter text-foreground">
      ETIQUETA R<Star className="inline-block w-4 h-4 md:w-5 md:h-5 fill-primary text-primary -mt-1" />
      JA
    </span>
  )
}

export function Header() {
  const { cartCount, setIsCartOpen, isMobileMenuOpen, setIsMobileMenuOpen } = useStore()

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-transparent">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full bg-background border-none p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-6 border-b border-border">
                    <Logo />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="hover:bg-transparent"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                  <nav className="flex flex-col p-6 gap-2">
                    {navLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-4xl font-black tracking-tight py-4 border-b border-border hover:text-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <a href="#" className="flex items-center">
            <Logo />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-bold tracking-wide hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-transparent">
              <Search className="h-5 w-5" />
              <span className="sr-only">Buscar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-transparent"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              <span className="sr-only">Carrito</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Cart Sheet */}
      <CartSheet />
    </header>
  )
}
