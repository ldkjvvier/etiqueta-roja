"use client"

import { StoreProvider, useStore } from "@/lib/store-context"
import { Header } from "@/components/header"
import { PromoBanner } from "@/components/promo-banner"
import { Hero } from "@/components/hero"
import { ProductGrid } from "@/components/product-grid"
import { Footer } from "@/components/footer"
import { ProductDetail } from "@/components/product-detail"

function MainContent() {
  const { selectedProduct } = useStore()

  // Show product detail if a product is selected
  if (selectedProduct) {
    return (
      <div className="min-h-screen flex flex-col">
        <PromoBanner />
        <Header />
        <main className="flex-1">
          <ProductDetail product={selectedProduct} />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PromoBanner />
      <Header />
      <main className="flex-1">
        <Hero />
        <ProductGrid />
      </main>
      <Footer />
    </div>
  )
}

export default function Home() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  )
}
