import { cn } from '@/lib/utils'

type StampLabel = 'AGOTADO' | 'DROP' | 'ÚLTIMO'

/**
 * Sello diagonal sobre la imagen del producto.
 * Variante aprobada: doble borde (border-2 + outline-1) + mix-blend-multiply.
 * El padre debe tener `position: relative`.
 * La imagen de fondo debe aplicar grayscale desde el componente que usa Stamp (no responsabilidad de Stamp).
 */
export function Stamp({
  label,
  className,
}: {
  label: StampLabel | (string & {})
  className?: string
}) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      aria-hidden="true"
    >
      <span
        className={cn(
          // Doble borde: border interior (2px) + outline exterior (1px) con 3px de gap
          // Nota: usar propiedad arbitraria para outline evita ambigüedad en Tailwind v4
          'border-2 border-brand-red',
          '[outline:1px_solid_var(--color-brand-red)] [outline-offset:3px]',
          // Rotación e integración visual con la imagen
          'rotate-[-8deg] mix-blend-multiply',
          // Tipografía
          'font-mono font-bold text-sm uppercase tracking-[0.2em]',
          'text-brand-red-strong',
          // Espaciado y fondo
          'px-3 py-1.5 bg-transparent whitespace-nowrap',
          className,
        )}
      >
        {label}
      </span>
    </div>
  )
}
