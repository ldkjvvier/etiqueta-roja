'use client'

import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Marcas de corte en las 4 esquinas de la imagen del producto.
 * El padre debe tener `position: relative` y `className="group/card"`.
 * Diseño aprobado: 1px × 13px, offset 8px, entrada desde afuera hacia adentro.
 */
export function CropMarks({ className }: { className?: string }) {
  const reduce = useReducedMotion()

  const base = cn(
    'absolute bg-brand-red',
    'opacity-0',
    'transition-[opacity,transform] duration-150 ease-out',
    'group-hover/card:opacity-100',
    'group-hover/card:translate-x-0 group-hover/card:translate-y-0',
  )

  return (
    <div
      className={cn('absolute inset-0 pointer-events-none', className)}
      aria-hidden="true"
    >
      {/* Top-left */}
      <span className={cn(base, 'top-2 left-2 h-px w-3.25',    reduce === false && '-translate-x-1')} />
      <span className={cn(base, 'top-2 left-2 h-3.25 w-px',    reduce === false && '-translate-y-1')} />
      {/* Top-right */}
      <span className={cn(base, 'top-2 right-2 h-px w-3.25',   reduce === false && 'translate-x-1')} />
      <span className={cn(base, 'top-2 right-2 h-3.25 w-px',   reduce === false && '-translate-y-1')} />
      {/* Bottom-left */}
      <span className={cn(base, 'bottom-2 left-2 h-px w-3.25',  reduce === false && '-translate-x-1')} />
      <span className={cn(base, 'bottom-2 left-2 h-3.25 w-px',  reduce === false && 'translate-y-1')} />
      {/* Bottom-right */}
      <span className={cn(base, 'bottom-2 right-2 h-px w-3.25', reduce === false && 'translate-x-1')} />
      <span className={cn(base, 'bottom-2 right-2 h-3.25 w-px', reduce === false && 'translate-y-1')} />
    </div>
  )
}
