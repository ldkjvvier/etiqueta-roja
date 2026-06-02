# Tarea 0 — Primitivas de Marca: CropMarks + Stamp

**Fecha:** 2026-06-01  
**Contexto:** Etiqueta Roja · Fase 2 · Pre-requisito para T1–T6  
**Aprobado visualmente por el usuario:** Variante B (crop marks estándar) + Variante D (sello doble borde + blend)

---

## Contexto

El diseño v1 corregía problemas superficiales (quitar `scale`, unificar badges) sin añadir un lenguaje propio. Tarea 0 define dos primitivas de marca que se reutilizan en toda la Fase 2: las **marcas de corte** (referencia tipográfica/de imprenta) y el **sello** (marca física sobre producto). Ambas derivan directamente del nombre de la marca — *etiqueta* = papelería, serigrafía, marcas de corte.

El sitio opera en **modo claro** únicamente.

---

## Prerequisitos de tokens (globals.css)

Dos tokens de marca faltan en `:root` y en `@theme inline`. Deben añadirse antes de implementar los componentes:

| Token CSS | Valor | Uso |
|---|---|---|
| `--color-brand-red` | `#E62727` | Color rojo de marca (crop marks, sello, badges) |
| `--color-brand-red-strong` | `#c81e1e` | Rojo oscuro (hover states, accesibilidad AA) |

En `:root`:
```css
--color-brand-red: #E62727;
--color-brand-red-strong: #c81e1e;
```

En `@theme inline`:
```css
--color-brand-red: var(--color-brand-red);
--color-brand-red-strong: var(--color-brand-red-strong);
```

> **Nota:** `motion/react` ya está instalado (v12.40.0) y `useReducedMotion` ya se usa en `product-card.tsx`. No requiere instalación adicional.

---

## 0.A — CropMarks (`components/brand/crop-marks.tsx`)

### Qué hace

Cuatro ticks en forma de L en cada esquina de la imagen del producto, imitando las marcas de corte de una hoja de impresión. Aparecen en hover con una micro-animación de entrada desde afuera hacia adentro.

### API

```tsx
<CropMarks />
// Sin props. Se posiciona con absolute inset-0.
// El padre debe tener position: relative.
// El padre debe tener className="group/card" para el trigger de hover.
```

### Implementación

- **8 `<span>`** estáticos, posicionados con Tailwind absolute
- **Color:** `bg-brand-red` (usa el token nuevo)
- **Tamaño aprobado (variante B):** `1px × 13px` — grosor 1px, longitud 13px
- **Offset desde esquina:** `8px`
- **Estado base:** `opacity-0 + translate-x/y-1` (invisible, desplazado 4px hacia afuera)
- **Hover:** `group-hover/card:opacity-100 group-hover/card:translate-x-0 group-hover/card:translate-y-0`
- **Transición:** `transition-[opacity,transform] duration-150 ease-out`
- **`prefers-reduced-motion`:** usar `useReducedMotion()` de `motion/react` — si `true`, solo cambiar opacidad (sin translate)

### Estructura de spans

```
TL: cm-tl-h (horizontal) + cm-tl-v (vertical)
TR: cm-tr-h + cm-tr-v
BL: cm-bl-h + cm-bl-v
BR: cm-br-h + cm-br-v
```

Cada span tiene clases propias para posición y dirección de entrada. El componente es `pointer-events-none`.

---

## 0.B — Stamp (`components/brand/stamp.tsx`)

### Qué hace

Una estampa diagonal sobre la imagen del producto para comunicar estados especiales: `AGOTADO`, `DROP`, `ÚLTIMO`. Imita un sello de tinta sobre papel — real, no digital.

### API

```tsx
<Stamp label="AGOTADO" />
<Stamp label="DROP" />
<Stamp label="ÚLTIMO" />
```

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `'AGOTADO' \| 'DROP' \| 'ÚLTIMO' \| string` | — | Texto del sello |
| `className` | `string` | `''` | Override de clases |

### Implementación (Variante D aprobada)

- **Contenedor:** `absolute inset-0 flex items-center justify-center pointer-events-none`
- **Elemento visual:**
  - `border-2 border-brand-red`
  - `ring-1 ring-brand-red ring-offset-2` (equivale al "doble borde" del diseño)
  - `rotate-[-8deg]`
  - `mix-blend-mode: multiply` → en modo claro, el sello "absorbe" la imagen como tinta
  - `font-mono font-bold text-sm uppercase tracking-[0.2em]`
  - `text-brand-red`
  - `px-3 py-1.5`
  - `bg-transparent`
- **Imagen del producto cuando hay sello:** el padre aplica `grayscale` + `brightness-90` (responsabilidad del product-card en T1, no del Stamp)

### WCAG AA

El rojo `#E62727` sobre blanco tiene ratio 4.02:1. Supera AA (4.5:1) con `--color-brand-red-strong` (`#c81e1e` → ratio 5.2:1). Usar `--color-brand-red-strong` para el label cuando la imagen de fondo sea clara.

> El componente Stamp no controla la imagen de fondo. La verificación de contraste recae en quien lo usa (T1).

---

## Estructura de archivos

```
components/
  brand/
    crop-marks.tsx   ← nuevo
    stamp.tsx        ← nuevo
    index.ts         ← re-export de ambos
```

---

## Criterios de aceptación

1. `<CropMarks />` renderiza sin errores en aislamiento (test card manual)
2. Los 8 ticks aparecen en hover con animación de entrada desde las esquinas
3. Con `prefers-reduced-motion` activo: los ticks aparecen/desaparecen en opacidad sin translate
4. `<Stamp label="AGOTADO" />` renderiza diagonal, legible, con doble borde rojo
5. El sello no agrega height ni desplaza el layout del card
6. Ambos componentes no tienen dependencias externas (solo `motion/react` para el hook)
7. TypeScript sin errores en build

---

## Verificación post-implementación

```bash
# 1. Build limpio
pnpm build

# 2. Visual check en dev server — abrir http://localhost:3000
# Verificar:
# - Grid de productos: hover en tarjeta → ticks rojos aparecen desde esquinas
# - Producto agotado: sello diagonal visible sobre imagen en escala de grises
# - Reducir motion en OS → ticks aparecen sin animación de translate

pnpm dev
```
