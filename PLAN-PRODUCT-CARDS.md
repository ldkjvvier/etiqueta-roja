# Plan de mejora — Tarjetas de producto (páginas de cliente)

> **Objetivo:** rediseñar la tarjeta de producto que se usa en el grid de cliente hacia un
> look **limpio y sin bordes**, inspirado en joiamarket.com / milkshakes, conservando una
> **identidad propia con acento rojo sutil** de Etiqueta Roja.
> **Alcance:** `ProductCard` y sus piezas (`ProductCardImage`, `ProductCardCarousel`,
> `ProductBadge`, skeleton). No toca PDP, checkout ni admin.

---

## 1. Decisiones confirmadas

| Tema | Decisión | Implicancia |
|---|---|---|
| **Fondo #eaeaea** | Es el **gris del set fotográfico**, ya horneado en las imágenes. No se programa como "recorte". | El tile debe usar ese mismo gris para que **la costura foto↔tile sea invisible** (loading, letterbox, gutters). |
| **Identidad** | **Limpio + acento rojo sutil.** | Sin borde, sin crop-marks, sin sello diagonal. Se conservan: precio de oferta en rojo, etiquetas `OFERTA`/`ÚLTIMO` rojas, mono en precios. `AGOTADO` pasa a overlay limpio. |
| **Hover** | **Crossfade suave (~300ms).** | Reemplaza el `clip-path` wipe actual. Accesible con `prefers-reduced-motion`. |

---

## 2. El cambio clave: superficie de producto = #eaeaea

Hoy el tile usa `bg-secondary` (**#efede8, cálido**) pero las fotos están sobre **#eaeaea (gris frío)**.
Eso produce una costura sutil en los bordes y durante la carga. La corrección base de todo el rediseño:

**Añadir un token dedicado** en [app/globals.css](app/globals.css):

```css
/* :root */
--product-surface: #eaeaea; /* gris del set fotográfico — fondo del tile de producto */
```

```css
/* @theme inline */
--color-product-surface: var(--product-surface);
```

Esto habilita `bg-product-surface`, que aplicaremos al contenedor de imagen y al skeleton.
Resultado: la foto (sobre gris) y el tile (mismo gris) se funden sin borde ni costura — el
producto "flota" sobre gris sin necesidad de recortes PNG.

> **Encuadre:** mantener `object-cover` (full-bleed, coincide con el pipeline actual y la
> densidad del grid). Como el fondo del tile = fondo de la foto, no hay costura. **Si algún
> producto se ve recortado**, cambiar esa imagen a `object-contain` — los gutters grises
> quedan invisibles igual. Es un toggle de una línea, no un rediseño.

---

## 3. Anatomía de la tarjeta nueva

```
 ┌───────────────────┐   ← SIN borde. Tile = bg-product-surface (#eaeaea)
 │ OFERTA            │   ← etiqueta sutil (rojo sobre pill crema), top-left
 │                   │
 │      [ foto ]     │   ← imagen 1 (object-cover). Hover → crossfade a imagen 2
 │                   │
 │                   │
 └───────────────────┘
   NOMBRE PRODUCTO        ← uppercase, font-medium (no bold), tracking-wide
   $19.990  $̶2̶4̶.̶9̶9̶0̶       ← precio mono; oferta en rojo + original tachado
```

Separación entre tarjetas: el grid mantiene `gap-6 md:gap-8` y el fondo de página
(`#f7f6f3`) hace de gutter — así los tiles grises se leen como piezas separadas sin borde.

---

## 4. Cambios por archivo

### 4.1 `app/globals.css` — token de superficie
Añadir `--product-surface` y `--color-product-surface` (ver §2).

### 4.2 `components/product-card.tsx` — sin borde + limpio
- **Eliminar** `border border-border`, `hover:border-foreground` y la transición de borde en ambas ramas (normal y `sold_out`).
- **Eliminar** imports y uso de `CropMarks` y `Stamp`.
- Tile de imagen: `bg-secondary` → `bg-product-surface`.
- Info: quitar el padding lateral (`p-3 md:p-4` → `pt-3`) para alinear el texto al borde del tile (estilo joia, texto "colgando" del tile).
- Nombre: `font-bold` → `font-medium` (más limpio, conserva uppercase + tracking).
- **Precio de oferta en rojo:** si hay `originalPrice`, el precio actual usa `text-primary-strong` (#c81e1e, cumple WCAG AA).
- **Foco visible:** al quitar el borde, agregar `focus-visible:ring-2 ring-ring ring-offset-2` al `<Link>` (regla a11y `focus-states`).
- **AGOTADO limpio** (reemplaza el sello diagonal): overlay tenue + label horizontal pequeño.

```tsx
const imageSection = (
  <div className="relative aspect-4/5 bg-product-surface overflow-hidden">
    <ProductCardImage images={cardImages} alt={product.name} isSoldOut={isSoldOut} />
    {badgeKind && <ProductBadge kind={badgeKind} />}
    {isSoldOut && (
      <div className="absolute inset-0 flex items-end justify-center bg-product-surface/30 pointer-events-none">
        <span className="mb-4 bg-background/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
          Agotado
        </span>
      </div>
    )}
  </div>
)

const infoSection = (
  <div className="pt-3 space-y-1">
    <h3 className="font-medium text-xs md:text-sm uppercase tracking-wide line-clamp-2 leading-snug">
      {product.name}
    </h3>
    <div className="flex items-baseline gap-2 tabular-nums">
      <span className={cn('font-mono font-semibold text-sm md:text-base', hasOffer && 'text-primary-strong')}>
        {formatPrice(product.price)}
      </span>
      {product.originalPrice && (
        <span className="font-mono text-muted-foreground line-through text-xs">
          {formatPrice(product.originalPrice)}
        </span>
      )}
    </div>
  </div>
)
```

El `<Link>` pierde el borde y gana foco visible:

```tsx
<Link
  href={product.slug ? `/producto/${product.slug}` : `/producto/${product.id}`}
  className={cn(
    'group/card block cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  )}
  aria-label={`Ver ${product.name}`}
>
```

### 4.3 `components/product-card-image.tsx` — crossfade en vez de wipe
- Reemplazar el bloque `clip-path` por **dos imágenes apiladas con `transition-opacity`**.
- Imagen 1: `group-hover/card:opacity-0`. Imagen 2: `opacity-0 → group-hover/card:opacity-100`.
- `duration-300 ease-out` + `motion-reduce:transition-none` (opacity es compositor-friendly, regla `transform-performance`).
- Ya no se necesita `useReducedMotion` (lo cubre `motion-reduce:`).

```tsx
<div className="relative w-full h-full hidden md:block">
  <Image
    src={primary} alt={alt} fill
    sizes="(max-width: 1280px) 33vw, 25vw"
    className={cn(
      'object-cover transition-opacity duration-300 ease-out motion-reduce:transition-none',
      hasSecondary && 'group-hover/card:opacity-0',
      isSoldOut && 'grayscale brightness-95',
    )}
  />
  {hasSecondary && (
    <Image
      src={secondary!} alt={`${alt} — vista alternativa`} fill
      sizes="(max-width: 1280px) 33vw, 25vw"
      className="object-cover opacity-0 transition-opacity duration-300 ease-out group-hover/card:opacity-100 motion-reduce:transition-none"
    />
  )}
</div>
```

### 4.4 `components/product-card-carousel.tsx` — controles limpios (mobile)
- El tile padre ya es `bg-product-surface`; imágenes siguen `object-cover`.
- **Quitar las flechas brutalistas** (`border border-foreground bg-background/80`): en mobile el gesto natural es swipe. Dejar **swipe + dots** = más limpio y elimina el problema de touch-target (las flechas miden 24–28px, por debajo del mínimo de 44px).
- Dots: mantener el patrón actual de hit-area, **subir el área táctil a ≥44px** (`w-11 h-11` con el span visual interno de 6px) para cumplir `touch-target-size`.
- `isSoldOut` sigue aplicando `grayscale`.

> Si se prefiere conservar flechas, **expandir su hit-area a 44×44** (visual chico + `hitSlop`/padding) y quitar el borde para alinearlas al look limpio.

### 4.5 `components/product-badge.tsx` — etiqueta sutil
- Pasar de **caja roja sólida** a **pill crema con texto rojo** (sutil pero con contraste garantizado sobre cualquier foto):

```tsx
<span className={cn(
  'absolute top-2 left-2 z-20',
  'bg-background/90 px-1.5 py-0.5',
  'font-mono text-[10px] font-bold uppercase tracking-[0.15em]',
  'text-primary-strong',
  className,
)}>
  {BADGE_LABELS[kind]}
</span>
```

### 4.6 `components/product-grid-skeleton.tsx` — match de superficie
- `SkeletonCell`: `bg-secondary` → `bg-product-surface` para que el estado de carga coincida con el tile real (evita parpadeo de color al hidratar). Mantener el barrido `skeleton-scan`.

### 4.7 Primitivas de marca `CropMarks` / `Stamp` — quedan huérfanas
Tras 4.2 ya no se usan en ningún lado (confirmado: solo las importaba `product-card.tsx`).
**Decisión a tomar:**
- **(a)** Borrar `components/brand/crop-marks.tsx`, `stamp.tsx` y limpiar `components/brand/index.ts`. *(recomendado si no van al PDP)*
- **(b)** Conservarlas para usarlas en la página de detalle de producto (PDP) más adelante.

`components/product-grid.tsx` no cambia su lógica; el `gap` actual ya funciona para el look sin borde.

---

## 5. Checklist de calidad (reglas ui-ux-pro-max aplicadas)

**Accesibilidad (CRÍTICO)**
- [ ] `focus-states`: anillo de foco visible en la tarjeta (reemplaza la señal que daba el borde).
- [ ] `color-not-only`: `AGOTADO`/`OFERTA`/`ÚLTIMO` comunican con **texto**, no solo color.
- [ ] `color-accessible-pairs`: rojo de precio/etiqueta = `--primary-strong` #c81e1e (AA). Tachado en `muted-foreground`.
- [ ] `alt-text`: alt descriptivo en ambas imágenes (ya presente).
- [ ] `reduced-motion`: crossfade con `motion-reduce:transition-none`.

**Touch & Interacción (CRÍTICO)**
- [ ] `touch-target-size`: dots ≥44px; flechas removidas o ≥44px.
- [ ] `hover-vs-tap`: el swap por hover es solo desktop; mobile usa carrusel (swipe), no depende de hover.
- [ ] `cursor-pointer`: presente en el `<Link>`.

**Rendimiento (ALTO)**
- [ ] `image-dimension`: `aspect-4/5` reserva espacio (CLS ~0).
- [ ] `transform-performance`: animar solo `opacity` (no width/height/clip-path).
- [ ] `lazy-load-below-fold`: imágenes con `loading="lazy"` salvo las above-the-fold.

**Tipografía & Color (MEDIO)**
- [ ] `number-tabular`: precios con `tabular-nums` + mono (alineación de columnas).
- [ ] `visual-hierarchy`: jerarquía por peso/tamaño/color, no por borde.

---

## 6. Fases de implementación

1. **Token base** — `--product-surface` en globals.css (§4.1). *(5 min)*
2. **Tarjeta sin borde + limpia** — refactor de `product-card.tsx`: quitar borde, crop-marks, stamp; AGOTADO limpio; oferta en rojo; foco visible (§4.2). *(45 min)*
3. **Crossfade** — reescribir `product-card-image.tsx` (§4.3). *(20 min)*
4. **Etiqueta sutil** — `product-badge.tsx` (§4.5). *(10 min)*
5. **Carrusel limpio + touch** — `product-card-carousel.tsx` (§4.4). *(30 min)*
6. **Skeleton match** — `product-grid-skeleton.tsx` (§4.6). *(5 min)*
7. **Cleanup primitivas** — decidir (a)/(b) sobre `CropMarks`/`Stamp` (§4.7). *(10 min)*
8. **QA** — recorrer checklist §5 en 375px, desktop, hover, teclado y `prefers-reduced-motion`. *(30 min)*

---

## 7. Riesgos / preguntas abiertas

- **Encuadre cover vs contain:** depende de la consistencia de aspect-ratio del set fotográfico. Default `cover`; switch a `contain` por producto si hay recorte (§2). *Verificar con fotos reales.*
- **Tratamiento de `name`:** se propone conservar uppercase + tracking (identidad editorial) con peso `medium`. Si se busca aún más cercano a joia, evaluar normal-case `font-medium text-sm`.
- **CropMarks/Stamp:** confirmar si se reutilizan en el PDP antes de borrar (§4.7).
- **Segunda imagen:** el crossfade requiere que el producto tenga ≥2 imágenes; con una sola, la tarjeta funciona igual (sin swap). *Sin acción, pero conviene poblar `product_images`.*
```