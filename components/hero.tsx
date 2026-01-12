"use client"

import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative bg-secondary border-b border-border">
      <div className="container mx-auto px-4">
        <div className="min-h-[60vh] md:min-h-[70vh] flex flex-col justify-center py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-bold tracking-widest text-primary mb-4">DROP EXCLUSIVO — EDICIÓN LIMITADA</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-6 text-balance">
              LA CALLE
              <br />
              ES NUESTRA
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-md">
              Piezas únicas que definen el estilo urbano. Una vez que se acaban, no vuelven.
            </p>
            <Button className="bg-primary text-primary-foreground hover:bg-foreground font-bold text-base px-10 py-6">
              VER COLECCIÓN
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-foreground" />
    </section>
  )
}
