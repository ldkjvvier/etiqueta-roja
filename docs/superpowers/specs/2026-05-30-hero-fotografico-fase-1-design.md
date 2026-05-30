# Fase 1 — Hero Fotográfico: Diseño (MVP estructurado para producción)

> **Fecha:** 2026-05-30
> **Estado:** Aprobado — listo para plan de implementación
> **Alcance:** Completar y endurecer la Fase 1 del rediseño del hero. Migrar de posicionamiento libre (x/y) a 4 presets curados responsive, con validaciones CMS y WYSIWYG real.

---

## Contexto y hallazgos

Auditoría del Hero Studio reveló que **~70% de la Fase 1 ya está commiteado** (no aparece en `git status`):

- ✅ Los 4 presets como tipo `HeroLayoutPreset` (`editorial-left`, `centered`, `product-right`, `fullbleed-bottom`).
- ✅ `HeroBannerLayout.tsx` renderiza split (50/50, 40/60) y fullbleed responsive con `order` mobile.
- ✅ Selector de 4 presets en `HeroSectionLayout.tsx`.
- ✅ `normalizeHeroConfig` soporta `layout_preset` en `hero.tsx`.
- ✅ LCP: `priority` / `fetchPriority="high"` / `sizes` presentes.

**Gaps reales que cubre esta fase:**

1. El hero en producción usa el **modo legacy** (`layout_preset: undefined`) con posicionamiento libre x/y, que el plan manda eliminar.
2. **Sin validaciones CMS**: `background_image` no es obligatorio; sin contador de palabras del subtítulo; sin aviso de longitud de título.
3. **Tipo `HeroLayoutPreset` duplicado** (`site-config.ts:150` y `heroStudio.types.ts:27`); metadatos de preset sueltos solo en el sidebar → sin single source of truth.
4. **Bug latente de WYSIWYG**: el preview del Studio (`HeroCanvasPreview` / `HeroRealViewEditor`) envuelve el contenido en `HeroElementRenderer` (posición absoluta), pero el hero público en modo preset renderiza markup flex-flow. **El preview no coincide con lo que ve el visitante** en ningún preset.
5. Path legacy de `hero.tsx` sin fallback de imagen.
6. UX del Studio sin ayudas contextuales por preset.

---

## Decisiones tomadas

| Decisión | Elección |
|---|---|
| Sistema legacy de posicionamiento libre | **Migrar y eliminar** (breaking change controlado con migración de `site_config`) |
| Preset por defecto para el config migrado | **`fullbleed-bottom`** |
| Migración DB | **Vía MCP de Supabase**, mostrando el SQL antes de aplicar |
| Enfoque de preview | **A — Renderer de preset compartido** (`HeroPresetContent` consumido por hero público y Studio) |

---

## Arquitectura propuesta

### 1. Single source of truth de presets — `lib/hero/presets.ts` (nuevo)

```ts
export type HeroLayoutPreset =
  | 'editorial-left'
  | 'centered'
  | 'product-right'
  | 'fullbleed-bottom'

export interface HeroPresetMeta {
  value: HeroLayoutPreset
  label: string
  description: string
  visual: string        // glifo para la tarjeta del selector
  helpText: string      // ayuda contextual / tooltip del admin
}

export const HERO_LAYOUT_PRESETS: readonly HeroPresetMeta[] = [ /* 4 entradas */ ]
export const DEFAULT_HERO_PRESET: HeroLayoutPreset = 'fullbleed-bottom'

export function isSplitPreset(preset?: HeroLayoutPreset): boolean {
  return preset === 'editorial-left' || preset === 'product-right'
}
```

- `lib/data/site-config.ts` y `types/heroStudio.types.ts` **re-exportan** `HeroLayoutPreset` desde aquí (eliminan la redefinición).
- `HeroSectionLayout.tsx`, `HeroBannerLayout.tsx` y `hero.tsx` consumen `HERO_LAYOUT_PRESETS` / `isSplitPreset` en lugar de literales repetidos.

### 2. Renderer compartido — `components/hero-studio/HeroPresetContent.tsx` (nuevo)

Extrae la jerarquía editorial flex-flow hoy inline en `hero.tsx:548-617`. Renderiza, en orden y con máximo 4 elementos visibles: eyebrow/badge → headline → subheadline → (drop-message / countdown / live-badge) → CTA.

- **Props:** `value` (config normalizado), `preset`, `dropPreview` opcional (estado del drop para countdown/badge/message), `ctaConfig`, `ctaLabel`, `ctaDisabled`.
- Consumido por:
  - El hero público (`hero.tsx`, path de preset).
  - El preview del Studio (reemplaza `HeroCanvasPreview` interno) → WYSIWYG real.

### 3. Eliminación del posicionamiento libre

**Borrar archivos:**
- `components/hero-studio/HeroRealViewEditor.tsx`
- `components/hero-studio/HeroElementRenderer.tsx`
- `components/hero-studio/HeroPositionControls.tsx`
- `components/hero-studio/HeroCanvasPreview.tsx` (reemplazado por preview basado en `HeroPresetContent`)
- `hooks/useHeroDragEditor.ts`

**Limpiar:**
- `hooks/useHeroStudioState.ts`: quitar `positions`, acciones `setPosition` / `resetPositions`.
- `types/heroStudio.types.ts`: quitar `HeroPositions`, `HeroDragTarget`, `HeroPosition`, `HeroElementType` (si solo lo usa el drag), `HERO_DEFAULT_POSITIONS`, campo `positions` de `HeroStudioState`.
- `lib/data/site-config.ts`: quitar todos los `hero_*_pos_x` / `hero_*_pos_y` y `hero_text_pos_*` de `HomeHeroBannerConfig`.
- `lib/actions/site-config.ts`: quitar el mapeo de esos campos en el payload submit.
- `hero.tsx`: quitar todo el bloque de `normalizeHeroConfig` que clampa coordenadas y **el path legacy completo (líneas 622-739)**. `layout_preset` deja de ser opcional en la práctica: si falta, se aplica `DEFAULT_HERO_PRESET`.
- `HeroBannerLayout.tsx`: quitar props `canvasRef`, `onCanvasPointerMove/Up/Leave` (solo las usaba el drag).
- `HeroStudio.tsx`: quitar `isRealViewOpen` y su effect; el grid pasa a [controles de form] + [preview `HeroPresetContent` read-only].
- `HeroSectionLayout.tsx`: quitar el botón "Quitar preset (usar posicionamiento libre)".

### 4. Validaciones CMS (bloquean el guardado)

En el form del Studio (junto al check de `hasInvalidVideoUrl` ya existente en `HeroStudio.tsx`):

- **`background_image` obligatorio:** error inline en `HeroSectionMedia` + `disabled` en "Guardar Hero" si vacío. Marca de campo requerido.
- **Descripción ≤ 20 palabras:** contador en vivo en `HeroSectionContent`; al superar, mensaje de error visible y bloqueo de guardado.
- **Título:** aviso preventivo (no bloqueante) al exceder longitud apta para 2 líneas (umbral por caracteres, p. ej. > 48).
- **Preset obligatorio:** sin modo libre, siempre hay preset; el estado inicial usa `DEFAULT_HERO_PRESET` si el config no trae uno.

Centralizar reglas en `lib/hero/validation.ts` (nuevo): `countWords`, `MAX_SUBTITLE_WORDS = 20`, `TITLE_SOFT_MAX = 48`, `validateHeroForSave(state) → { ok, errors }` reutilizable entre UI (deshabilitar botón) y el server action (defensa server-side).

### 5. LCP / imagen

- `DEV_HERO_FALLBACK = 'https://picsum.photos/seed/etiqueta-roja-hero/1600/900'` centralizado en `lib/hero/presets.ts`.
- Con imagen obligatoria, el fallback queda solo para desarrollo/preview.
- Verificar `sizes` por preset: `100vw` fullbleed; `50vw`/`60vw` en columnas split (ya presente). `priority` + `fetchPriority="high"` en la imagen del hero (ya presente).

### 6. UX del Studio

- Tarjetas de preset con `helpText` (descripción + caso de uso) desde `HERO_LAYOUT_PRESETS`.
- Tooltip/ayuda contextual junto al selector.
- Espaciado y labels consistentes con el resto de secciones del sidebar.

### 7. Migración DB (vía MCP, SQL revisado antes de aplicar)

Migración versionada sobre `home_hero_banner` en `site_config`:
1. Leer el `value` JSON actual.
2. Setear `value.layout_preset = 'fullbleed-bottom'`.
3. Eliminar todas las claves `hero_*_pos_x` / `hero_*_pos_y` / `hero_text_pos_*` del JSON.
4. No tocar `is_active` ni otros campos.

---

## Fuera de alcance (mejoras futuras)

- Focal point / crop avanzado de imagen (editor visual dedicado).
- Medición automática de contraste AA sobre la imagen.
- Animaciones framer-motion del hero.
- Migración de `supabase as any` a cliente tipado (auditoría B-01, fuera de Fase 1).

---

## Criterios de aceptación (MVP producción)

**Funcional**
- [ ] Los 4 presets renderizan idénticos en hero público y en preview del Studio (WYSIWYG).
- [ ] No se puede guardar sin `background_image`.
- [ ] El contador de palabras del subtítulo bloquea > 20 palabras.
- [ ] El config de producción quedó migrado a `fullbleed-bottom` y renderiza sin coordenadas.
- [ ] No queda código de drag/posicionamiento libre en el árbol.

**Técnico**
- [ ] `HeroLayoutPreset` definido una sola vez; el resto re-exporta.
- [ ] `tsc` sin errores; ESLint sin errores; build sin warnings críticos.
- [ ] Sin imports rotos tras eliminar archivos legacy.

**Responsive (320 / 375 / 768 / 1024 / 1440)**
- [ ] Sin solapes, overflows ni saltos bruscos en ningún preset.
- [ ] Mobile prioriza imagen arriba / contenido abajo en split.

**Performance**
- [ ] Imagen del hero es candidato LCP con `priority` + `fetchPriority="high"` + `sizes` correcto.
- [ ] Sin layout shift por aspect ratio del hero.

---

## Riesgos

- **Breaking change de render:** el hero de producción cambia de legacy a `fullbleed-bottom`. Mitigación: migración explícita revisada + verificación visual post-deploy.
- **Imports colaterales:** `HeroElementType` puede usarse fuera del drag; verificar antes de borrar.
- **Estado persistido viejo:** otros registros `site_config` con `hero_*_pos_*` quedan ignorados por el normalize; aceptable (se limpian en la migración del registro activo).
