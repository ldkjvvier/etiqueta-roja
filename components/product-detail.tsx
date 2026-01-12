"use client"

import { useState } from "react"
import { ArrowLeft, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore, type Product } from "@/lib/store-context"

export function ProductDetail({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const { setSelectedProduct, addToCart, generateWhatsAppMessage } = useStore()

  const isSoldOut = product.stockStatus === "sold_out"

  const handleWhatsAppOrder = () => {
    if (!selectedSize) return
    window.open(generateWhatsAppMessage(product, selectedSize), "_blank")
  }

  const handleAddToCart = () => {
    if (!selectedSize) return
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      image: product.image,
    })
    setSelectedSize(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setSelectedProduct(null)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Inicio</span>
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">Stock</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">{product.name}</span>
        </nav>
      </div>

      {/* Product Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="relative aspect-square bg-secondary overflow-hidden">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className={`w-full h-full object-cover ${isSoldOut ? "opacity-50 grayscale" : ""}`}
            />

            {/* Stock Badge */}
            {product.stockStatus === "low" && (
              <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm font-bold px-4 py-2 uppercase tracking-wider">
                Low Stock
              </span>
            )}
            {isSoldOut && (
              <span className="absolute top-4 left-4 bg-foreground text-background text-sm font-bold px-4 py-2 uppercase tracking-wider">
                Sold Out
              </span>
            )}

            {/* Sale Badge */}
            {product.originalPrice && !isSoldOut && (
              <span className="absolute top-4 right-4 bg-primary text-primary-foreground text-sm font-bold px-4 py-2">
                OFERTA
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl md:text-4xl font-black">${product.price}</span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">${product.originalPrice}</span>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="font-bold text-sm uppercase tracking-wide mb-2 text-muted-foreground">Descripción</h3>
              <p className="text-foreground leading-relaxed">
                {product.description ||
                  "Prenda premium de nuestra última colección. Fabricada con materiales de alta calidad para máxima comodidad y durabilidad. Corte moderno oversize que define el streetwear contemporáneo."}
              </p>
            </div>

            {/* Size Selector */}
            {!isSoldOut && (
              <div className="mb-8">
                <h3 className="font-bold text-sm uppercase tracking-wide mb-3 text-muted-foreground">
                  Selecciona tu talla
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3.5rem] h-12 text-sm font-bold border-2 transition-all ${
                        selectedSize === size
                          ? "bg-foreground text-background border-foreground"
                          : "bg-transparent text-foreground border-border hover:border-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4 mt-auto">
              {!isSoldOut ? (
                <>
                  {/* WhatsApp Primary CTA */}
                  <Button
                    onClick={handleWhatsAppOrder}
                    disabled={!selectedSize}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-black text-lg py-8 gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MessageCircle className="h-6 w-6" />
                    {selectedSize ? "PEDIR POR WHATSAPP" : "SELECCIONA TU TALLA"}
                  </Button>

                  {/* Add to Cart Secondary */}
                  <Button
                    onClick={handleAddToCart}
                    disabled={!selectedSize}
                    variant="outline"
                    className="w-full border-2 border-foreground text-foreground hover:bg-foreground hover:text-background font-bold py-6 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
                  >
                    AGREGAR AL CARRITO
                  </Button>
                </>
              ) : (
                <Button disabled className="w-full font-bold py-8 text-lg opacity-50 cursor-not-allowed">
                  AGOTADO
                </Button>
              )}
            </div>

            {/* Info Note */}
            {!isSoldOut && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                Al hacer clic en "Pedir por WhatsApp" se abrirá una conversación con nuestro equipo para coordinar tu
                pedido.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
