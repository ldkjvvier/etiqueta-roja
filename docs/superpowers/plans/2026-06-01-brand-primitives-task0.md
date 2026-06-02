# Brand Primitives — Task 0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear los dos componentes de identidad de marca que se usarán en toda la Fase 2: `<CropMarks>` (ticks en las esquinas de las tarjetas en hover) y `<Stamp>` (sello diagonal para productos agotados/drops).

**Architecture:** Dos componentes React puros en `components/brand/`. Zero runtime externo — solo `useReducedMotion` de `motion/react` (ya instalado). El color de marca se registra como token CSS en `globals.css` siguiendo el patrón existente del proyecto (`:root` → `@theme inline`).

**Tech Stack:** Next.js 15, Tailwind CSS v4, `motion/react` v12 (ya instalado), TypeScript.

---

## Mapa de archivos

| Operación | Archivo | Responsabilidad |
|-----------|---------|-----------------|
| Modificar | `styles/globals.css` | Añadir tokens `--brand-red` y `--brand-red-strong` |
| Crear | `components/brand/crop-marks.tsx` | Componente CropMarks |
| Crear | `components/brand/stamp.tsx` | Componente Stamp |
| Crear | `components/brand/index.ts` | Re-export de ambos |

---

## Task 1: Brand Color Tokens

**Files:**
- Modify: `styles/globals.css`

- [ ] **Step 1: Añadir valores raw en `:root`**

Abre `styles/globals.css`. Localiza el bloque `:root { ... }`. Justo **antes del cierre** `}` del bloque `:root`, añade:

```css
  /* Brand identity */
  --brand-red: #E62727;
  --brand-red-strong: #c81e1e;
```

El bloque `:root` debe quedar con `--brand-red` y `--brand-red-strong` al final, antes de `}`.

- [ ] **Step 2: Registrar en `@theme inline`**

En el mismo archivo, localiza el bloque `@theme inline { ... }`. Justo **antes del cierre** `}` de ese bloque, añade:

```css
  --color-brand-red: var(--brand-red);
  --color-brand-red-strong: var(--brand-red-strong);
```

Esto habilita las clases `bg-brand-red`, `text-brand-red`, `border-brand-red`, `text-brand-red-strong`, etc. en Tailwind.

- [ ] **Step 3: Verificar que el build no rompe**

```bash
cd "C:/Users/javie/OneDrive/Escritorio/etiqueta-roja"
pnpm build
```

Resultado esperado: build completa sin errores TypeScript ni CSS. Si aparece un error de CSS sobre las variables, verificar que los dos bloques están dentro de `:root` y `@theme inline` respectivamente (no fuera).

- [ ] **Step 4: Commit**

```bash
git add styles/globals.css
git commit -m "feat(brand): add brand-red color tokens to theme"
```

---

## Task 2: Componente CropMarks

**Files:**
- Create: `components/brand/crop-marks.tsx`

- [ ] **Step 1: Crear el directorio y archivo**

```bash
mkdir -p "C:/Users/javie/OneDrive/Escritorio/etiqueta-roja/components/brand"
```

Crea el archivo `components/brand/crop-marks.tsx` con este contenido exacto:

```tsx
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
      <span className={cn(base, 'top-2 left-2 h-px w-3.25',    !reduce && '-translate-x-1')} />
      <span className={cn(base, 'top-2 left-2 h-3.25 w-px',    !reduce && '-translate-y-1')} />
      {/* Top-right */}
      <span className={cn(base, 'top-2 right-2 h-px w-3.25',   !reduce && 'translate-x-1')} />
      <span className={cn(base, 'top-2 right-2 h-3.25 w-px',   !reduce && '-translate-y-1')} />
      {/* Bottom-left */}
      <span className={cn(base, 'bottom-2 left-2 h-px w-3.25',  !reduce && '-translate-x-1')} />
      <span className={cn(base, 'bottom-2 left-2 h-3.25 w-px',  !reduce && 'translate-y-1')} />
      {/* Bottom-right */}
      <span className={cn(base, 'bottom-2 right-2 h-px w-3.25', !reduce && 'translate-x-1')} />
      <span className={cn(base, 'bottom-2 right-2 h-3.25 w-px', !reduce && 'translate-y-1')} />
    </div>
  )
}
```

**Cómo funciona:**
- 8 `<span>` absolutos, 2 por esquina (horizontal + vertical)
- `reduce = true` → solo opacidad (sin translate), respeta `prefers-reduced-motion`
- `reduce = false` → ticks desplazados 4px hacia afuera, entran al hacer hover en el padre con `group/card`
- `group-hover/card:translate-x-0 group-hover/card:translate-y-0` resetea cualquier translate al hacer hover

- [ ] **Step 2: Verificar TypeScript**

```bash
cd "C:/Users/javie/OneDrive/Escritorio/etiqueta-roja"
pnpm build
```

Resultado esperado: sin errores. Si `bg-brand-red` no es reconocido, confirmar que el Task 1 fue aplicado correctamente en `globals.css`.

- [ ] **Step 3: Commit**

```bash
git add components/brand/crop-marks.tsx
git commit -m "feat(brand): add CropMarks primitive component"
```

---

## Task 3: Componente Stamp

**Files:**
- Create: `components/brand/stamp.tsx`

- [ ] **Step 1: Crear el archivo**

Crea `components/brand/stamp.tsx` con este contenido exacto:

```tsx
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
  label: StampLabel | string
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
```

**Cómo funciona:**
- `border-2 border-brand-red` → borde interior de 2px rojo
- `[outline:1px_solid_var(--color-brand-red)] [outline-offset:3px]` → borde exterior de 1px con 3px de separación → efecto de doble marco
- `mix-blend-multiply` → el sello "absorbe" la imagen como tinta sobre papel (funciona en modo claro)
- `text-brand-red-strong` (`#c81e1e`) en lugar de `text-brand-red` → ratio WCAG AA 5.2:1
- No es `'use client'` — componente servidor, sin hooks

- [ ] **Step 2: Verificar TypeScript**

```bash
cd "C:/Users/javie/OneDrive/Escritorio/etiqueta-roja"
pnpm build
```

Resultado esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/brand/stamp.tsx
git commit -m "feat(brand): add Stamp primitive component"
```

---

## Task 4: Barrel Export + Verificación final de tipos

**Files:**
- Create: `components/brand/index.ts`

- [ ] **Step 1: Crear el barrel export**

Crea `components/brand/index.ts`:

```ts
export { CropMarks } from './crop-marks'
export { Stamp } from './stamp'
```

Esto permite importar ambos desde `@/components/brand` en lugar de paths individuales.

- [ ] **Step 2: Build completo final**

```bash
cd "C:/Users/javie/OneDrive/Escritorio/etiqueta-roja"
pnpm build
```

Resultado esperado:
```
✓ Compiled successfully
✓ Linting and checking validity of types
```

No debe haber ningún error de TypeScript ni warnings de Tailwind sobre clases desconocidas.

- [ ] **Step 3: Commit**

```bash
git add components/brand/index.ts
git commit -m "feat(brand): export brand primitives from barrel"
```

---

## Task 5: Smoke Test Visual

**Files:**
- Modify temporalmente: `components/product-card.tsx` (revertir al final)

El objetivo es ver ambos componentes en acción en el browser antes de declarar T0 completo.

- [ ] **Step 1: Arrancar el dev server**

```bash
cd "C:/Users/javie/OneDrive/Escritorio/etiqueta-roja"
pnpm dev
```

Abrir `http://localhost:3000`.

- [ ] **Step 2: Añadir CropMarks al product card (temporal)**

En `components/product-card.tsx`, añade el import:

```tsx
import { CropMarks } from '@/components/brand'
```

Localiza la sección `imageSection`. El `<div>` que envuelve la imagen tiene actualmente:
```tsx
<div className="relative aspect-4/5 bg-secondary overflow-hidden">
```

Añade `group/card` a ese div y coloca `<CropMarks />` dentro:

```tsx
<div className="relative aspect-4/5 bg-secondary overflow-hidden group/card">
  <ProductCardImage ... />
  <CropMarks />
  {/* ... resto de badges */}
```

- [ ] **Step 3: Añadir Stamp a un producto agotado (temporal)**

En el mismo `imageSection`, localiza el bloque del badge de agotado:

```tsx
{isSoldOut && (
  <span className="absolute top-3 left-3 bg-foreground text-background text-[10px] font-bold px-2 py-1 uppercase tracking-wider z-20">
    Agotado
  </span>
)}
```

Reemplázalo temporalmente:

```tsx
{isSoldOut && <Stamp label="AGOTADO" />}
```

Y añade `grayscale` condicional al div de imagen (mismo div donde añadiste `group/card`):

```tsx
<div className={cn(
  'relative aspect-4/5 bg-secondary overflow-hidden group/card',
  isSoldOut && 'grayscale'
)}>
```

También importa `Stamp` y `cn`:

```tsx
import { CropMarks, Stamp } from '@/components/brand'
import { cn } from '@/lib/utils'
```

- [ ] **Step 4: Verificar en browser**

Abrir `http://localhost:3000`. Ir a la sección de productos.

Verificar:
1. Al hacer hover sobre una tarjeta → aparecen 4 ticks rojos en las esquinas, entran desde afuera
2. Si hay un producto con stock_status = `sold_out` → aparece el sello diagonal "AGOTADO" en rojo con doble borde
3. Activar `prefers-reduced-motion` en el OS (Configuración → Accesibilidad → Reducir movimiento) → los ticks deben aparecer/desaparecer sin animación de desplazamiento

- [ ] **Step 5: Revertir product-card.tsx**

**IMPORTANTE:** Revertir `product-card.tsx` a su estado original. T0 solo crea las primitivas — la integración real ocurre en T1.

```bash
git checkout -- components/product-card.tsx
```

- [ ] **Step 6: Commit final**

```bash
git add .
git commit -m "feat(brand): complete Task 0 — CropMarks and Stamp primitives ready"
```

---

## Criterios de aceptación (checklist final)

- [ ] `pnpm build` pasa sin errores TypeScript
- [ ] `<CropMarks />` renderiza 8 spans, ticks rojos visibles en hover
- [ ] La animación de los ticks entra desde afuera hacia adentro en 150ms
- [ ] Con `prefers-reduced-motion`: solo opacidad, sin translate
- [ ] `<Stamp label="AGOTADO" />` renderiza diagonal con doble borde rojo
- [ ] El sello no desplaza el layout (position absolute)
- [ ] `import { CropMarks, Stamp } from '@/components/brand'` funciona desde cualquier archivo del proyecto

---

## Notas para T1 (no implementar en T0)

- Añadir `group/card` permanentemente al `<div>` de imagen en `product-card.tsx`
- Reemplazar el badge genérico de "Agotado" con `<Stamp>`
- Aplicar `grayscale` a la imagen cuando el producto está agotado
- Eliminar `scale` del hover del card (si existe)
