export function PromoBanner() {
  return (
    <div className="bg-foreground text-background py-3 border-b border-foreground overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="mx-8 text-sm font-bold tracking-widest">
            ENVÍO GRATIS EN PEDIDOS +$100 ★ DROP LIMITADO ★ NO RESTOCK ★
          </span>
        ))}
      </div>
    </div>
  )
}
