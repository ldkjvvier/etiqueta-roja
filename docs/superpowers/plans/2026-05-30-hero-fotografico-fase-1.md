# Fase 1 — Hero Fotográfico Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar el hero de posicionamiento libre (x/y) a 4 presets curados responsive, con WYSIWYG real entre el hero público y el preview del Studio, validaciones CMS (imagen obligatoria, subtítulo ≤20 palabras) y el config de producción migrado a `fullbleed-bottom`.

**Architecture:** Un módulo central `lib/hero/presets.ts` es la única fuente de verdad del tipo `HeroLayoutPreset`, sus metadatos y helpers de estilo. Un componente presentacional `HeroPresetContent` renderiza la jerarquía editorial flex-flow y es consumido tanto por el hero público (`hero.tsx`) como por el preview del Studio. Se elimina todo el sistema de drag/coordenadas y se reemplaza por un preview read-only que usa el mismo renderer.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, TailwindCSS 4, react-hook-form + zod, Supabase (vía MCP para la migración). Gestor de paquetes: **pnpm** (no npm). Sin runner de tests en el proyecto — la verificación de cada tarea es `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build` y checks visuales responsive.

**Convención de edición:** Donde un paso dice "buscar … reemplazar por …", localizar el bloque por su contenido (no por número de línea, que cambia entre tareas).

---

### Task 1: Módulo central de presets

**Files:**
- Create: `lib/hero/presets.ts`

- [ ] **Step 1: Crear el módulo con tipo canónico, metadatos y helpers**

```ts
// lib/hero/presets.ts
import type { HeroCTAConfig } from '@/lib/validation/hero-cta'

export type HeroLayoutPreset =
	| 'editorial-left'
	| 'centered'
	| 'product-right'
	| 'fullbleed-bottom'

export interface HeroPresetMeta {
	value: HeroLayoutPreset
	label: string
	description: string
	/** Glifo monoespaciado para la tarjeta del selector. */
	visual: string
	/** Ayuda contextual / caso de uso para el admin. */
	helpText: string
}

export const HERO_LAYOUT_PRESETS: readonly HeroPresetMeta[] = [
	{
		value: 'editorial-left',
		label: 'Editorial',
		description: 'Texto izquierda, foto derecha (50/50)',
		visual: '▐▌',
		helpText:
			'Copy alineado a la izquierda con la foto cubriendo el 60% derecho. Ideal para el drop de un producto individual.',
	},
	{
		value: 'centered',
		label: 'Centrado',
		description: 'Foto full-bleed, copy centrado',
		visual: '▬',
		helpText:
			'Foto a sangre completa con overlay y copy centrado. Ideal para el hero de temporada.',
	},
	{
		value: 'product-right',
		label: 'Producto',
		description: 'Foto dominante derecha (40/60)',
		visual: '▐▐▌',
		helpText:
			'Producto a gran escala a la derecha, copy a la izquierda. Ideal para un nuevo drop prominente.',
	},
	{
		value: 'fullbleed-bottom',
		label: 'Cine',
		description: 'Foto full-bleed, texto al fondo',
		visual: '▬▄',
		helpText:
			'Foto a sangre completa con el copy en el tercio inferior. Estética cinematográfica/editorial.',
	},
]

export const DEFAULT_HERO_PRESET: HeroLayoutPreset = 'fullbleed-bottom'

/** Imagen de relleno solo para desarrollo/preview cuando aún no hay foto. */
export const DEV_HERO_FALLBACK =
	'https://picsum.photos/seed/etiqueta-roja-hero/1600/900'

const PRESET_VALUES = new Set<HeroLayoutPreset>(
	HERO_LAYOUT_PRESETS.map((preset) => preset.value),
)

export function isHeroLayoutPreset(
	value: unknown,
): value is HeroLayoutPreset {
	return (
		typeof value === 'string' &&
		PRESET_VALUES.has(value as HeroLayoutPreset)
	)
}

/** Presets de dos columnas (imagen + contenido lado a lado). */
export function isSplitPreset(preset?: HeroLayoutPreset): boolean {
	return preset === 'editorial-left' || preset === 'product-right'
}

export type HeroTitleFontWeight = 'bold' | 'black' | 'outline'
export type HeroContentAlignment = 'left' | 'center' | 'right'

export function titleWeightClass(weight: HeroTitleFontWeight): string {
	if (weight === 'bold') return 'font-bold'
	if (weight === 'outline') {
		return 'font-black text-transparent [-webkit-text-stroke:2px_currentColor]'
	}
	return 'font-black'
}

/** `sizes` óptimo para la imagen LCP según el preset. */
export function heroImageSizes(preset: HeroLayoutPreset): string {
	if (preset === 'product-right') return '(min-width: 768px) 60vw, 100vw'
	if (preset === 'editorial-left') return '(min-width: 768px) 50vw, 100vw'
	return '100vw'
}

// Tipo re-exportado por conveniencia para consumidores del módulo.
export type { HeroCTAConfig }
```

- [ ] **Step 2: Verificar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: PASS (módulo nuevo, sin romper nada existente).

- [ ] **Step 3: Commit**

```bash
git add lib/hero/presets.ts
git commit -m "feat(hero): central preset module (single source of truth)"
```

---

### Task 2: Deduplicar el tipo `HeroLayoutPreset`

**Files:**
- Modify: `lib/data/site-config.ts`
- Modify: `types/heroStudio.types.ts`

- [ ] **Step 1: Re-exportar el tipo en `site-config.ts`**

Buscar este bloque en `lib/data/site-config.ts`:

```ts
export type HeroLayoutPreset =
	| 'editorial-left'
	| 'centered'
	| 'product-right'
	| 'fullbleed-bottom'
```

Reemplazar por:

```ts
export type { HeroLayoutPreset } from '@/lib/hero/presets'
```

- [ ] **Step 2: Re-exportar el tipo en `heroStudio.types.ts`**

Buscar este bloque en `types/heroStudio.types.ts`:

```ts
export type HeroLayoutPreset =
	| 'editorial-left'
	| 'centered'
	| 'product-right'
	| 'fullbleed-bottom'
```

Reemplazar por:

```ts
export type { HeroLayoutPreset } from '@/lib/hero/presets'
```

- [ ] **Step 3: Verificar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: PASS. Los consumidores (`hero.tsx`, `HeroBannerLayout.tsx`, `HeroSectionLayout.tsx`) siguen importando el mismo nombre y forma.

- [ ] **Step 4: Commit**

```bash
git add lib/data/site-config.ts types/heroStudio.types.ts
git commit -m "refactor(hero): dedupe HeroLayoutPreset to single source"
```

---

### Task 3: Módulo de validación del hero

**Files:**
- Create: `lib/hero/validation.ts`

- [ ] **Step 1: Crear el módulo de validación pura**

```ts
// lib/hero/validation.ts

export const MAX_SUBTITLE_WORDS = 20
export const TITLE_SOFT_MAX = 48

export function countWords(value: string): number {
	const trimmed = value.trim()
	if (!trimmed) return 0
	return trimmed.split(/\s+/).length
}

export interface HeroValidationInput {
	backgroundImage: string
	description: string
}

export interface HeroValidationResult {
	ok: boolean
	errors: {
		backgroundImage?: string
		description?: string
	}
}

/**
 * Reglas que bloquean el guardado del hero. Compartida entre la UI
 * (deshabilitar el botón) y el server action (defensa server-side).
 */
export function validateHeroForSave(
	input: HeroValidationInput,
): HeroValidationResult {
	const errors: HeroValidationResult['errors'] = {}

	if (!input.backgroundImage.trim()) {
		errors.backgroundImage = 'La imagen de fondo es obligatoria.'
	}

	if (countWords(input.description) > MAX_SUBTITLE_WORDS) {
		errors.description = `El subtítulo no puede superar ${MAX_SUBTITLE_WORDS} palabras.`
	}

	return { ok: Object.keys(errors).length === 0, errors }
}
```

- [ ] **Step 2: Verificar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Verificación manual de la lógica pura (sin runner de tests)**

Razonar contra estos casos (no hay framework de test instalado; confirmar por inspección):
- `countWords('')` → `0`; `countWords('  ')` → `0`; `countWords('hola   mundo')` → `2`.
- `validateHeroForSave({ backgroundImage: '', description: 'x' })` → `ok:false`, `errors.backgroundImage` definido.
- `validateHeroForSave({ backgroundImage: 'u', description: 'a '.repeat(21) })` → `ok:false`, `errors.description` definido.
- `validateHeroForSave({ backgroundImage: 'u', description: 'corto' })` → `ok:true`, `errors` vacío.

- [ ] **Step 4: Commit**

```bash
git add lib/hero/validation.ts
git commit -m "feat(hero): pure validation helpers (image required, subtitle word cap)"
```

---

### Task 4: Renderer compartido `HeroPresetContent`

**Files:**
- Create: `components/hero-studio/HeroPresetContent.tsx`

Este componente presentacional reemplaza al markup inline de `hero.tsx` y al `HeroElementRenderer` del Studio. Recibe valores ya resueltos; no calcula estado de drop.

- [ ] **Step 1: Crear el componente**

```tsx
// components/hero-studio/HeroPresetContent.tsx
'use client'

import { HeroDropCountdown } from '@/components/HeroDropCountdown'
import { HeroCTA } from '@/components/hero-studio/HeroCTA'
import {
	HeroLayoutPreset,
	isSplitPreset,
	titleWeightClass,
	type HeroCTAConfig,
	type HeroTitleFontWeight,
} from '@/lib/hero/presets'

export interface HeroPresetContentProps {
	preset: HeroLayoutPreset
	badge?: string
	badgeColor: string
	title: string
	titleColor: string
	titleFontWeight: HeroTitleFontWeight
	description?: string
	descriptionColor: string

	showDropMessage: boolean
	dropMessage?: string

	showCountdown: boolean
	countdownTarget?: string | null
	countdownBgColor: string
	countdownTextColor: string

	showLiveBadge: boolean
	liveBadgeText?: string
	liveBadgeBgColor: string
	liveBadgeTextColor: string

	showCta: boolean
	ctaConfig: HeroCTAConfig
	ctaLabel?: string
	ctaHref?: string
	ctaDisabled: boolean
	/** En el preview del Studio el CTA no debe navegar. */
	ctaForceButton?: boolean
}

export function HeroPresetContent(props: HeroPresetContentProps) {
	const split = isSplitPreset(props.preset)
	const alignmentClass =
		props.preset === 'centered'
			? 'items-center text-center'
			: 'items-start text-left'

	return (
		<div className={`flex flex-col gap-5 ${alignmentClass}`}>
			{props.badge && (
				<p
					className="text-sm font-bold tracking-widest"
					style={{ color: props.badgeColor }}
				>
					{props.badge}
				</p>
			)}

			<h1
				className={`max-w-2xl text-balance text-5xl leading-none tracking-tighter md:text-6xl lg:text-7xl ${titleWeightClass(
					props.titleFontWeight,
				)}`}
				style={{ color: props.titleColor }}
			>
				{props.title || 'Título principal del Hero'}
			</h1>

			{props.description && (
				<p
					className="max-w-md text-lg leading-relaxed"
					style={{ color: props.descriptionColor }}
				>
					{props.description}
				</p>
			)}

			{props.showDropMessage && props.dropMessage && (
				<p
					className={`max-w-lg text-sm font-semibold tracking-wide ${
						split ? 'text-muted-foreground' : 'text-white/90'
					}`}
				>
					{props.dropMessage}
				</p>
			)}

			{props.showCountdown && props.countdownTarget && (
				<HeroDropCountdown
					targetDate={props.countdownTarget}
					containerBgColor={props.countdownBgColor}
					unitBgColor="rgba(0,0,0,0.35)"
					textColor={props.countdownTextColor}
				/>
			)}

			{props.showLiveBadge && props.liveBadgeText && (
				<span
					className="inline-flex w-fit px-3 py-1 text-xs font-bold tracking-wider"
					style={{
						backgroundColor: props.liveBadgeBgColor,
						color: props.liveBadgeTextColor,
					}}
				>
					{props.liveBadgeText}
				</span>
			)}

			{props.showCta && props.ctaLabel && props.ctaHref && (
				<div>
					<HeroCTA
						config={props.ctaConfig}
						text={props.ctaLabel}
						href={props.ctaHref}
						disabled={props.ctaDisabled}
						forceButton={props.ctaForceButton}
					/>
				</div>
			)}
		</div>
	)
}
```

- [ ] **Step 2: Verificar que `HeroCTA` acepta `forceButton`**

Run: `pnpm exec tsc --noEmit`
Expected: PASS. (`HeroElementRenderer` ya usa `forceButton` en `HeroCTA`, por lo que la prop existe. Si `tsc` se queja de `forceButton`, abrir `components/hero-studio/HeroCTA.tsx` y confirmar la prop opcional `forceButton?: boolean`.)

- [ ] **Step 3: Commit**

```bash
git add components/hero-studio/HeroPresetContent.tsx
git commit -m "feat(hero): shared presentational HeroPresetContent renderer"
```

---

### Task 5: Reemplazar el preview del Studio y borrar el sistema de drag

**Files:**
- Modify: `components/hero-studio/HeroStudio.tsx`
- Delete: `components/hero-studio/HeroRealViewEditor.tsx`
- Delete: `components/hero-studio/HeroElementRenderer.tsx`
- Delete: `components/hero-studio/HeroPositionControls.tsx`
- Delete: `components/hero-studio/HeroCanvasPreview.tsx`
- Delete: `hooks/useHeroDragEditor.ts`
- Create: `components/hero-studio/HeroStudioPreview.tsx`

- [ ] **Step 1: Crear el nuevo preview read-only del Studio**

```tsx
// components/hero-studio/HeroStudioPreview.tsx
'use client'

import { memo } from 'react'
import { HeroDropPreview } from '@/services/heroDropService'
import { HeroStudioState } from '@/types/heroStudio.types'
import { HeroBannerLayout } from './HeroBannerLayout'
import { HeroPresetContent } from './HeroPresetContent'
import { DEFAULT_HERO_PRESET, DEV_HERO_FALLBACK } from '@/lib/hero/presets'

interface HeroStudioPreviewProps {
	state: HeroStudioState
	dropPreview: HeroDropPreview
}

function HeroStudioPreviewComponent({
	state,
	dropPreview,
}: HeroStudioPreviewProps) {
	const preset = state.layout.layoutPreset ?? DEFAULT_HERO_PRESET
	const heroImage = state.media.backgroundImage || DEV_HERO_FALLBACK

	return (
		<section
			className="col-span-12 overflow-auto rounded-lg border bg-card p-4 lg:col-span-6"
			aria-labelledby="hero-preview-title"
			aria-describedby="hero-preview-description"
		>
			<div className="mb-3">
				<h2 id="hero-preview-title" className="text-sm font-semibold">
					Vista previa
				</h2>
				<p
					id="hero-preview-description"
					className="text-xs text-muted-foreground"
				>
					Refleja exactamente cómo se verá el hero publicado.
				</p>
			</div>

			<div className="overflow-hidden rounded-lg border bg-secondary">
				<HeroBannerLayout
					preset={preset}
					bannerHeight={state.layout.bannerHeight}
					overlayOpacity={state.styles.overlayOpacity}
					backgroundImage={heroImage}
					backgroundImageMobile={
						state.media.backgroundImageMobile || heroImage
					}
					backgroundVideoUrl={state.media.backgroundVideoUrl}
					renderEmbeddableVideo
					rootClassName="border-b-0"
				>
					<HeroPresetContent
						preset={preset}
						badge={state.content.badge}
						badgeColor={state.styles.badgeColor}
						title={state.content.title}
						titleColor={state.styles.titleColor}
						titleFontWeight={state.styles.titleFontWeight}
						description={state.content.description}
						descriptionColor={state.styles.descriptionColor}
						showDropMessage={dropPreview.showMessage}
						dropMessage={dropPreview.message}
						showCountdown={dropPreview.showCountdown}
						countdownTarget={dropPreview.countdownTarget}
						countdownBgColor={state.dropConfig.dropCountdownBgColor}
						countdownTextColor={state.dropConfig.dropCountdownTextColor}
						showLiveBadge={dropPreview.showLiveBadge}
						liveBadgeText={state.dropConfig.dropLiveBadgeText}
						liveBadgeBgColor={state.dropConfig.dropLiveBadgeBgColor}
						liveBadgeTextColor={state.dropConfig.dropLiveBadgeTextColor}
						showCta={dropPreview.showCta}
						ctaConfig={state.cta}
						ctaLabel={dropPreview.ctaText}
						ctaHref={state.cta.link}
						ctaDisabled={dropPreview.ctaDisabled}
						ctaForceButton
					/>
				</HeroBannerLayout>
			</div>

			<div className="mt-3 space-y-1 text-xs text-muted-foreground">
				{!state.isActive && (
					<p>El banner está desactivado y no se mostrará en la home.</p>
				)}
				{state.dropConfig.linkedDropId && (
					<p>Drop enlazado: {state.dropConfig.linkedDropId}</p>
				)}
				{dropPreview.status && (
					<p>Vista previa del drop: {dropPreview.status}</p>
				)}
				<p>Modo drop: {state.dropConfig.dropDisplayMode}</p>
			</div>
		</section>
	)
}

export const HeroStudioPreview = memo(HeroStudioPreviewComponent)
```

- [ ] **Step 2: Actualizar `HeroStudio.tsx` — imports**

Buscar en `components/hero-studio/HeroStudio.tsx`:

```tsx
import { HeroCanvasPreview } from './HeroCanvasPreview'
import { HeroRealViewEditor } from './HeroRealViewEditor'
import { HeroConfigForm } from './HeroConfigForm'
import { HeroPositionControls } from './HeroPositionControls'
```

Reemplazar por:

```tsx
import { HeroStudioPreview } from './HeroStudioPreview'
import { HeroConfigForm } from './HeroConfigForm'
```

- [ ] **Step 3: Actualizar `HeroStudio.tsx` — quitar estado `isRealViewOpen`**

Buscar y eliminar esta línea:

```tsx
	const [isRealViewOpen, setIsRealViewOpen] = useState(false)
```

Buscar y eliminar este `useEffect` completo:

```tsx
	useEffect(() => {
		if (!isStudioOpen && isRealViewOpen) {
			setIsRealViewOpen(false)
		}
	}, [isRealViewOpen, isStudioOpen])
```

Buscar este `useEffect` de teclado y reemplazar el handler para quitar la rama `isRealViewOpen`:

```tsx
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				if (isRealViewOpen) {
					setIsRealViewOpen(false)
					return
				}
				setIsStudioOpen(false)
			}
		}
```

Reemplazar por:

```tsx
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsStudioOpen(false)
			}
		}
```

En ese mismo `useEffect`, su array de dependencias es `[isRealViewOpen, isStudioOpen]`. Reemplazarlo por `[isStudioOpen]`.

- [ ] **Step 4: Actualizar `HeroStudio.tsx` — grid de contenido**

Buscar:

```tsx
							<div className="grid flex-1 grid-cols-12 gap-4 overflow-hidden p-4">
								<HeroPositionControls
									state={state}
									selectedDrop={selectedDrop}
									dropPreview={dropPreview}
									onResetPositions={() =>
										dispatch({ type: 'resetPositions' })
									}
								/>
								<HeroCanvasPreview
									state={state}
									dropPreview={dropPreview}
									onOpenRealView={() => setIsRealViewOpen(true)}
								/>
								<HeroConfigForm
									state={state}
									dispatch={dispatch}
									dropOptions={dropOptions}
								/>
							</div>
```

Reemplazar por:

```tsx
							<div className="grid flex-1 grid-cols-12 gap-4 overflow-hidden p-4">
								<HeroStudioPreview
									state={state}
									dropPreview={dropPreview}
								/>
								<HeroConfigForm
									state={state}
									dispatch={dispatch}
									dropOptions={dropOptions}
								/>
							</div>
```

- [ ] **Step 5: Actualizar `HeroStudio.tsx` — quitar el `<HeroRealViewEditor>`**

Buscar y eliminar este bloque completo (justo antes del `</>` final):

```tsx
			<HeroRealViewEditor
				open={isRealViewOpen}
				state={state}
				dropPreview={dropPreview}
				onClose={() => setIsRealViewOpen(false)}
				onPositionChange={(target, x, y) =>
					dispatch({
						type: 'setPosition',
						element: target,
						position: { x, y },
					})
				}
			/>
```

- [ ] **Step 6: Verificar que `selectedDrop` sigue usándose**

`selectedDrop` se sigue usando en `buildDropPreview(state, selectedDrop, previewNowMs)`, así que no se vuelve variable muerta. Confirmar que sigue desestructurado de `useHeroStudioState`.

- [ ] **Step 7: Borrar los archivos de drag**

```bash
git rm components/hero-studio/HeroRealViewEditor.tsx \
	components/hero-studio/HeroElementRenderer.tsx \
	components/hero-studio/HeroPositionControls.tsx \
	components/hero-studio/HeroCanvasPreview.tsx \
	hooks/useHeroDragEditor.ts
```

- [ ] **Step 8: Verificar build (detecta imports rotos)**

Run: `pnpm exec tsc --noEmit`
Expected: PASS. Nada referencia ya los archivos borrados. `HeroBannerLayout` conserva las props `canvasRef`/pointer (ahora sin uso) — se limpian en Task 7.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "refactor(hero): replace drag canvas with read-only preset preview"
```

---

### Task 6: Refactor del hero público

**Files:**
- Modify: `components/hero.tsx`

- [ ] **Step 1: Actualizar imports**

Buscar en `components/hero.tsx`:

```tsx
import { HeroDropCountdown } from '@/components/HeroDropCountdown'
import { HeroBannerLayout } from '@/components/hero-studio/HeroBannerLayout'
import { HeroCTA } from '@/components/hero-studio/HeroCTA'
import { getHeroLinkedDropSummary } from '@/lib/data/drops'
import {
	getSiteConfig,
	HeroCTAConfig,
	HomeHeroBannerConfig,
	HeroLayoutPreset,
} from '@/lib/data/site-config'
import { getHeroCTAConfig } from '@/lib/services/hero-cta-config'
```

Reemplazar por:

```tsx
import { HeroBannerLayout } from '@/components/hero-studio/HeroBannerLayout'
import { HeroPresetContent } from '@/components/hero-studio/HeroPresetContent'
import { getHeroLinkedDropSummary } from '@/lib/data/drops'
import {
	getSiteConfig,
	HeroCTAConfig,
	HomeHeroBannerConfig,
} from '@/lib/data/site-config'
import {
	DEFAULT_HERO_PRESET,
	DEV_HERO_FALLBACK,
	isSplitPreset,
} from '@/lib/hero/presets'
import { getHeroCTAConfig } from '@/lib/services/hero-cta-config'
```

- [ ] **Step 2: Quitar las coordenadas del objeto `fallback`**

En el objeto `fallback: HomeHeroBannerConfig = { ... }`, eliminar todas las líneas `hero_*_pos_x`/`hero_*_pos_y` y `hero_text_pos_x`/`hero_text_pos_y`:

```tsx
	hero_badge_pos_x: 50,
	hero_badge_pos_y: 30,
	hero_title_pos_x: 50,
	hero_title_pos_y: 44,
	hero_description_pos_x: 50,
	hero_description_pos_y: 58,
	hero_drop_message_pos_x: 50,
	hero_drop_message_pos_y: 68,
	hero_countdown_pos_x: 50,
	hero_countdown_pos_y: 76,
	hero_live_badge_pos_x: 50,
	hero_live_badge_pos_y: 76,
	hero_text_pos_x: 50,
	hero_text_pos_y: 48,
	hero_cta_pos_x: 50,
	hero_cta_pos_y: 78,
```

Y cambiar `layout_preset: undefined,` por `layout_preset: DEFAULT_HERO_PRESET,`.

- [ ] **Step 3: Quitar el clamping de coordenadas de `normalizeHeroConfig`**

Dentro del `return { ...fallback, ...incoming, cta: normalizedCta, ... }` de `normalizeHeroConfig`, eliminar todas las claves `hero_badge_pos_x` … `hero_cta_pos_y` y `hero_text_pos_x`/`hero_text_pos_y` (el bloque de líneas con `Math.max(0, Math.min(100, ...))` para cada coordenada). Conservar el resto (background, drop_*, colors, overlay_opacity, content_alignment, banner_height, layout_preset).

Cambiar la resolución de `layout_preset` para que siempre haya preset. Buscar:

```tsx
		layout_preset: (
			value?.layout_preset === 'editorial-left' ||
			value?.layout_preset === 'centered' ||
			value?.layout_preset === 'product-right' ||
			value?.layout_preset === 'fullbleed-bottom'
		)
			? value.layout_preset
			: undefined,
```

Reemplazar por:

```tsx
		layout_preset: (
			value?.layout_preset === 'editorial-left' ||
			value?.layout_preset === 'centered' ||
			value?.layout_preset === 'product-right' ||
			value?.layout_preset === 'fullbleed-bottom'
		)
			? value.layout_preset
			: DEFAULT_HERO_PRESET,
```

- [ ] **Step 4: Reemplazar el render por `HeroPresetContent` y borrar el path legacy**

En `export async function Hero()`, localizar el bloque `// --- PRESET RENDERING (responsive flow layout) ---` que empieza en `if (value.layout_preset) {` y TODO lo que le sigue hasta el cierre de la función (incluye el `// --- LEGACY RENDERING ...` con posiciones absolutas). Reemplazar desde `// --- PRESET RENDERING` hasta el final de la función por:

```tsx
	// --- PRESET RENDERING (responsive flow layout) ---
	const preset = value.layout_preset ?? DEFAULT_HERO_PRESET
	const split = isSplitPreset(preset)
	const heroImage = value.background_image || DEV_HERO_FALLBACK

	return (
		<HeroBannerLayout
			preset={preset}
			bannerHeight={value.banner_height}
			overlayOpacity={value.overlay_opacity}
			backgroundImage={heroImage}
			backgroundImageMobile={value.background_image_mobile || heroImage}
			backgroundVideoUrl={split ? '' : (value.background_video_url ?? '')}
			renderEmbeddableVideo={!split}
			showBottomBorder
		>
			<HeroPresetContent
				preset={preset}
				badge={value.badge}
				badgeColor={value.badge_color}
				title={value.title}
				titleColor={value.title_color}
				titleFontWeight={titleFontWeight}
				description={value.description}
				descriptionColor={value.description_color}
				showDropMessage={Boolean(shouldShowDropMessage && resolvedDropMessage)}
				dropMessage={resolvedDropMessage}
				showCountdown={Boolean(shouldShowCountdown && linkedDrop?.start_time)}
				countdownTarget={linkedDrop?.start_time}
				countdownBgColor={value.drop_countdown_bg_color}
				countdownTextColor={value.drop_countdown_text_color}
				showLiveBadge={Boolean(shouldShowLiveBadge)}
				liveBadgeText={value.drop_live_badge_text}
				liveBadgeBgColor={value.drop_live_badge_bg_color}
				liveBadgeTextColor={value.drop_live_badge_text_color}
				showCta={Boolean(shouldShowCta)}
				ctaConfig={ctaConfig}
				ctaLabel={ctaLabel}
				ctaHref={ctaConfig.link}
				ctaDisabled={ctaDisabled}
			/>
		</HeroBannerLayout>
	)
}
```

- [ ] **Step 5: Eliminar variables ahora sin uso en `Hero()`**

Tras el reemplazo, estas locales ya no se usan y harán fallar el lint (`@typescript-eslint/no-unused-vars`). Eliminar sus declaraciones:
- `dropTextAlignmentClass`
- `heightClassBySetting`
- `alignmentClassBySetting`
- `titleWeightClassBySetting`

Conservar `titleFontWeight` (se pasa a `HeroPresetContent`). Si `HeroDropCountdown` / `HeroCTA` quedaron sin usar tras quitar sus imports en Step 1 (ya quitados), no debe quedar referencia: confirmar que no se referencian más en el archivo.

- [ ] **Step 6: Verificar build y lint**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: PASS, sin warnings de variables sin uso.

- [ ] **Step 7: Commit**

```bash
git add components/hero.tsx
git commit -m "refactor(hero): public hero renders via HeroPresetContent, drop legacy path"
```

---

### Task 7: Limpiar props de canvas/pointer en `HeroBannerLayout`

**Files:**
- Modify: `components/hero-studio/HeroBannerLayout.tsx`

- [ ] **Step 1: Quitar las props de drag de la interfaz**

Buscar y eliminar de `interface HeroBannerLayoutProps`:

```tsx
	canvasRef?: React.Ref<HTMLDivElement>
	onCanvasPointerMove?: (
		event: React.PointerEvent<HTMLDivElement>,
	) => void
	onCanvasPointerUp?: (
		event: React.PointerEvent<HTMLDivElement>,
	) => void
	onCanvasPointerLeave?: (
		event: React.PointerEvent<HTMLDivElement>,
	) => void
```

- [ ] **Step 2: Quitar las props de la desestructuración**

En la firma de `export function HeroBannerLayout({ ... })`, eliminar `canvasRef`, `onCanvasPointerMove`, `onCanvasPointerUp`, `onCanvasPointerLeave`.

- [ ] **Step 3: Quitar los handlers del JSX**

En el bloque split, en el `<div ref={canvasRef} ... onPointerMove/onPointerUp/onPointerLeave>` eliminar `ref={canvasRef}` y los tres `onPointer*`. En el bloque fullbleed, hacer lo mismo en el `<div ref={canvasRef} ...>`. Conservar `canvasClassName` y `children`.

- [ ] **Step 4: Usar `isSplitPreset` del módulo central (DRY)**

Buscar:

```tsx
	const isSplitPreset =
		preset === 'editorial-left' || preset === 'product-right'
```

Reemplazar por (renombrando la local para no chocar con el import):

```tsx
	const splitPreset = isSplitPreset(preset)
```

Y actualizar su uso `if (isSplitPreset) {` → `if (splitPreset) {`. Añadir el import al inicio del archivo:

```tsx
import { isSplitPreset } from '@/lib/hero/presets'
```

- [ ] **Step 5: Verificar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: PASS. Los dos consumidores restantes (`HeroStudioPreview`, hero público) no pasan props de pointer.

- [ ] **Step 6: Commit**

```bash
git add components/hero-studio/HeroBannerLayout.tsx
git commit -m "refactor(hero): drop drag props from HeroBannerLayout, reuse isSplitPreset"
```

---

### Task 8: Quitar posicionamiento del estado y los tipos

**Files:**
- Modify: `hooks/useHeroStudioState.ts`
- Modify: `types/heroStudio.types.ts`

- [ ] **Step 1: `useHeroStudioState.ts` — imports**

Buscar:

```ts
import {
	HERO_DEFAULT_POSITIONS,
	HeroDropOption,
	HeroElementType,
	HeroPosition,
	HeroStudioState,
} from '@/types/heroStudio.types'
```

Reemplazar por:

```ts
import {
	HeroDropOption,
	HeroStudioState,
} from '@/types/heroStudio.types'
```

- [ ] **Step 2: `useHeroStudioState.ts` — quitar acciones de posición**

En `type HeroStudioAction`, eliminar las dos variantes:

```ts
	| {
			type: 'setPosition'
			element: HeroElementType
			position: HeroPosition
	  }
	| { type: 'resetPositions' }
```

En `heroStudioReducer`, eliminar los `case 'setPosition':` y `case 'resetPositions':` completos (conservar `setField`, `setTopLevel`, `default`).

- [ ] **Step 3: `useHeroStudioState.ts` — quitar `positions` del estado inicial**

En `buildInitialState`, eliminar todo el bloque `positions: { badge: {...}, title: {...}, ... cta: {...} }` (el último campo del objeto retornado).

- [ ] **Step 4: `useHeroStudioState.ts` — quitar coordenadas del `submitPayload`**

En el objeto `value:` de `submitPayload`, eliminar todas las claves de coordenadas:

```ts
				hero_badge_pos_x: state.positions.badge.x,
				hero_badge_pos_y: state.positions.badge.y,
				hero_title_pos_x: state.positions.title.x,
				hero_title_pos_y: state.positions.title.y,
				hero_description_pos_x: state.positions.description.x,
				hero_description_pos_y: state.positions.description.y,
				hero_drop_message_pos_x: state.positions['drop-message'].x,
				hero_drop_message_pos_y: state.positions['drop-message'].y,
				hero_countdown_pos_x: state.positions.countdown.x,
				hero_countdown_pos_y: state.positions.countdown.y,
				hero_live_badge_pos_x: state.positions['live-badge'].x,
				hero_live_badge_pos_y: state.positions['live-badge'].y,
				hero_text_pos_x: state.positions.title.x,
				hero_text_pos_y: state.positions.title.y,
				hero_cta_pos_x: state.positions.cta.x,
				hero_cta_pos_y: state.positions.cta.y,
```

- [ ] **Step 5: `heroStudio.types.ts` — quitar tipos de posición**

Eliminar estas declaraciones:

```ts
export type HeroElementType =
	| 'badge'
	| 'title'
	| 'description'
	| 'drop-message'
	| 'countdown'
	| 'live-badge'
	| 'cta'

export type HeroDragTarget = HeroElementType | null

export interface HeroPosition {
	x: number
	y: number
}

export type HeroPositions = Record<HeroElementType, HeroPosition>
```

En `interface HeroStudioState`, eliminar la línea `positions: HeroPositions`.

Eliminar al final del archivo:

```ts
export const HERO_DEFAULT_POSITIONS: HeroPositions = {
	badge: { x: 50, y: 30 },
	title: { x: 50, y: 44 },
	description: { x: 50, y: 58 },
	'drop-message': { x: 50, y: 68 },
	countdown: { x: 50, y: 76 },
	'live-badge': { x: 50, y: 76 },
	cta: { x: 50, y: 78 },
}
```

Conservar `HeroTitleFontWeight`, `HeroContentAlignment`, `HeroBannerHeight`, `HeroDropStatus`, `HeroDropDisplayMode`, etc.

- [ ] **Step 6: Verificar build (detecta usos residuales de posiciones)**

Run: `pnpm exec tsc --noEmit`
Expected: PASS. Si falla por `HeroElementType`/`positions` en algún archivo no contemplado, ese archivo es parte del sistema legacy ya borrado — revisar el error y corregir.

- [ ] **Step 7: Commit**

```bash
git add hooks/useHeroStudioState.ts types/heroStudio.types.ts
git commit -m "refactor(hero): remove positioning from studio state and types"
```

---

### Task 9: Quitar campos de coordenadas del config y del server action

**Files:**
- Modify: `lib/data/site-config.ts`
- Modify: `lib/actions/site-config.ts`

- [ ] **Step 1: `site-config.ts` — quitar campos del tipo `HomeHeroBannerConfig`**

Eliminar de `interface HomeHeroBannerConfig` todas las líneas opcionales de coordenadas:

```ts
	hero_badge_pos_x?: number
	hero_badge_pos_y?: number
	hero_title_pos_x?: number
	hero_title_pos_y?: number
	hero_description_pos_x?: number
	hero_description_pos_y?: number
	hero_drop_message_pos_x?: number
	hero_drop_message_pos_y?: number
	hero_countdown_pos_x?: number
	hero_countdown_pos_y?: number
	hero_live_badge_pos_x?: number
	hero_live_badge_pos_y?: number
	hero_text_pos_x?: number
	hero_text_pos_y?: number
	hero_cta_pos_x?: number
	hero_cta_pos_y?: number
```

- [ ] **Step 2: `actions/site-config.ts` — limpiar el path JSON (`updateHomeHeroBanner`)**

En el `const value: HomeHeroBannerConfig = { ...parsedPayload.value, cta: parsedCta.data, hero_badge_pos_x: ..., ..., overlay_opacity: ... }`, eliminar TODAS las claves `hero_*_pos_x`/`hero_*_pos_y` y `hero_text_pos_*` (los bloques `Math.max(0, Math.min(100, Number(parsedPayload.value.hero_*_pos_* ?? N)))`). Conservar `...parsedPayload.value`, `cta: parsedCta.data` y `overlay_opacity`. Resultado:

```ts
				const value: HomeHeroBannerConfig = {
					...parsedPayload.value,
					cta: parsedCta.data,
					overlay_opacity: Math.max(
						0,
						Math.min(
							100,
							Number(parsedPayload.value.overlay_opacity ?? 45),
						),
					),
				}
```

- [ ] **Step 3: `actions/site-config.ts` — limpiar el path FormData (fallback legacy)**

En la misma función, más abajo está el fallback que lee campos sueltos de `FormData`. Eliminar las constantes de coordenadas (`heroBadgePosXRaw` … `heroCtaPosY`, incluyendo los `Number(formData.get('hero_*'))` y sus correspondientes `Number.isFinite(...) ? clamp : default`). Luego, en el `const value: HomeHeroBannerConfig = { ... }` de este path, eliminar todas las claves `hero_*_pos_x`/`hero_*_pos_y` y `hero_text_pos_*`. Conservar el resto (badge, title, description, cta, background_*, drop_*, colors, overlay_opacity, content_alignment, banner_height).

- [ ] **Step 4: `actions/site-config.ts` — persistir `layout_preset` en el path FormData**

El path FormData no incluye `layout_preset`. Para no perderlo en ese flujo, añadir tras `const bannerHeight = ...`:

```ts
	const layoutPresetRaw = formData.get('layout_preset') as string | null
	const layoutPreset =
		layoutPresetRaw === 'editorial-left' ||
		layoutPresetRaw === 'centered' ||
		layoutPresetRaw === 'product-right' ||
		layoutPresetRaw === 'fullbleed-bottom'
			? layoutPresetRaw
			: 'fullbleed-bottom'
```

Y añadir `layout_preset: layoutPreset,` al `const value: HomeHeroBannerConfig = { ... }` de ese path.

> Nota: el flujo real del Studio usa el path JSON (`hero_payload`), que ya propaga `layout_preset` vía `...parsedPayload.value`. Este Step solo endurece el fallback.

- [ ] **Step 5: Verificar build**

Run: `pnpm exec tsc --noEmit`
Expected: PASS. Ninguna referencia a `hero_*_pos_*` debe quedar. Confirmar con: `pnpm exec rg "hero_\w+_pos_" -g "*.ts" -g "*.tsx"` → sin resultados en `lib/`, `components/`, `hooks/`, `types/`.

- [ ] **Step 6: Commit**

```bash
git add lib/data/site-config.ts lib/actions/site-config.ts
git commit -m "refactor(hero): drop coordinate fields from config type and server action"
```

---

### Task 10: Validaciones CMS en el Studio

**Files:**
- Modify: `components/hero-studio/sidebar/HeroSectionMedia.tsx`
- Modify: `components/hero-studio/sidebar/HeroSectionContent.tsx`
- Modify: `components/hero-studio/HeroStudio.tsx`
- Modify: `lib/actions/site-config.ts`

- [ ] **Step 1: `HeroSectionMedia.tsx` — imagen obligatoria con error inline**

Tras `const backgroundVideoUrl = form.watch('backgroundVideoUrl')` añadir:

```tsx
	const missingImage = !backgroundImage?.trim()
```

Bajo el `<Input id="background_image" .../>` y su `<Input type="file" .../>`, añadir el mensaje y marcar el label como requerido. Cambiar el `<Label htmlFor="background_image">Imagen de Fondo (URL)</Label>` por:

```tsx
				<Label htmlFor="background_image">
					Imagen de Fondo (URL){' '}
					<span className="text-destructive">*</span>
				</Label>
```

E inmediatamente después del segundo `<Input type="file" ...>` del bloque de imagen de fondo, añadir:

```tsx
					{missingImage && (
						<p className="text-xs text-destructive">
							La imagen de fondo es obligatoria.
						</p>
					)}
```

- [ ] **Step 2: `HeroSectionContent.tsx` — contador de palabras del subtítulo**

Añadir el import al inicio:

```tsx
import {
	countWords,
	MAX_SUBTITLE_WORDS,
	TITLE_SOFT_MAX,
} from '@/lib/hero/validation'
```

Dentro del componente, tras `const description = form.watch('description')` añadir:

```tsx
	const descriptionWordCount = countWords(description ?? '')
	const descriptionOverLimit =
		descriptionWordCount > MAX_SUBTITLE_WORDS
	const titleTooLong = (title?.length ?? 0) > TITLE_SOFT_MAX
```

Bajo el `<Textarea id="description" .../>`, añadir el contador:

```tsx
					<p
						className={`text-xs ${
							descriptionOverLimit
								? 'text-destructive'
								: 'text-muted-foreground'
						}`}
					>
						{descriptionWordCount}/{MAX_SUBTITLE_WORDS} palabras
						{descriptionOverLimit &&
							' — supera el máximo recomendado'}
					</p>
```

Bajo el `<Input id="title" .../>`, añadir el aviso preventivo (no bloqueante):

```tsx
					{titleTooLong && (
						<p className="text-xs text-amber-600">
							Título largo: puede superar 2 líneas en mobile.
						</p>
					)}
```

- [ ] **Step 3: `HeroStudio.tsx` — bloquear guardado si la validación falla**

Añadir import:

```tsx
import { validateHeroForSave } from '@/lib/hero/validation'
```

Tras `const hasInvalidVideoUrl = useMemo(...)`, añadir:

```tsx
	const heroValidation = useMemo(
		() =>
			validateHeroForSave({
				backgroundImage: state.media.backgroundImage,
				description: state.content.description,
			}),
		[state.media.backgroundImage, state.content.description],
	)
```

Cambiar el botón de submit:

```tsx
									<Button
										type="submit"
										disabled={isPending || hasInvalidVideoUrl}
									>
										{isPending ? 'Guardando...' : 'Guardar Hero'}
									</Button>
```

por:

```tsx
									<Button
										type="submit"
										disabled={
											isPending ||
											hasInvalidVideoUrl ||
											!heroValidation.ok
										}
									>
										{isPending ? 'Guardando...' : 'Guardar Hero'}
									</Button>
```

Y justo encima de los botones del header (dentro del `<div className="flex items-center gap-2">` que los contiene, antes del botón Cerrar), añadir un aviso compacto cuando haya errores:

```tsx
										{!heroValidation.ok && (
											<span className="self-center text-xs text-destructive">
												{heroValidation.errors.backgroundImage ??
													heroValidation.errors.description}
											</span>
										)}
```

- [ ] **Step 4: `actions/site-config.ts` — defensa server-side (path JSON)**

Añadir import al inicio del archivo:

```ts
import { validateHeroForSave } from '@/lib/hero/validation'
```

En `updateHomeHeroBanner`, dentro del path JSON, tras el chequeo de `isValidExternalVideoUrl(parsedPayload.value.background_video_url ...)` y antes de `parseHeroCTAConfig`, añadir:

```ts
					const heroValidation = validateHeroForSave({
						backgroundImage:
							parsedPayload.value.background_image || '',
						description: parsedPayload.value.description || '',
					})
					if (!heroValidation.ok) {
						return {
							message:
								heroValidation.errors.backgroundImage ??
								heroValidation.errors.description ??
								'Datos del hero inválidos',
							error: true,
						}
					}
```

- [ ] **Step 5: Verificar build y lint**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/hero-studio/sidebar/HeroSectionMedia.tsx \
	components/hero-studio/sidebar/HeroSectionContent.tsx \
	components/hero-studio/HeroStudio.tsx \
	lib/actions/site-config.ts
git commit -m "feat(hero): CMS validations (required image, subtitle word cap, title warning)"
```

---

### Task 11: UX del selector de presets

**Files:**
- Modify: `components/hero-studio/sidebar/HeroSectionLayout.tsx`

- [ ] **Step 1: Consumir `HERO_LAYOUT_PRESETS` del módulo central**

Buscar el `const LAYOUT_PRESETS: {...}[] = [ ... ]` local (las 4 entradas con `value/label/description/visual`) y eliminarlo. Añadir import:

```tsx
import { HERO_LAYOUT_PRESETS } from '@/lib/hero/presets'
```

En el `.map`, cambiar `LAYOUT_PRESETS.map((preset) => {` por `HERO_LAYOUT_PRESETS.map((preset) => {`.

- [ ] **Step 2: Mostrar `helpText` y `title` para ayuda contextual**

Dentro del `<button>` de cada preset, añadir `title={preset.helpText}` al elemento `<button>` (tooltip nativo) y, bajo el `<p>` de `description`, añadir el caso de uso. Reemplazar el contenido interno del botón:

```tsx
								<span className="mb-1 block font-mono text-base">
									{preset.visual}
								</span>
								<p className="text-sm font-semibold leading-tight">
									{preset.label}
								</p>
								<p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">
									{preset.description}
								</p>
```

por:

```tsx
								<span className="mb-1 block font-mono text-base">
									{preset.visual}
								</span>
								<p className="text-sm font-semibold leading-tight">
									{preset.label}
								</p>
								<p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">
									{preset.helpText}
								</p>
```

Y añadir `title={preset.helpText}` a la etiqueta de apertura `<button ... >`.

- [ ] **Step 3: Quitar el botón "usar posicionamiento libre"**

Buscar y eliminar este bloque completo:

```tsx
				{layoutPreset && (
					<button
						type="button"
						className="w-full text-left text-xs text-muted-foreground underline-offset-2 hover:underline"
						onClick={() => {
							form.setValue('layoutPreset', undefined)
							setField('layout', 'layoutPreset', '')
						}}
					>
						Quitar preset (usar posicionamiento libre)
					</button>
				)}
```

- [ ] **Step 4: Verificar build y lint**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/hero-studio/sidebar/HeroSectionLayout.tsx
git commit -m "feat(hero): preset selector uses central metadata + help text, drop free-positioning toggle"
```

---

### Task 12: Migración del registro `site_config` (vía MCP)

**Files:** ninguno (operación de base de datos).

> Proyecto Supabase: `ysemzrgzrouyzirlxhxj`. Ejecutar vía el servidor MCP de Supabase, mostrando el SQL antes de aplicar.

- [ ] **Step 1: Leer el config actual**

Ejecutar (SELECT de solo lectura) para inspeccionar el `value` actual de `home_hero_banner`:

```sql
select id, store_id, key, value
from public.site_config
where key = 'home_hero_banner';
```

Confirmar que `value` no tiene `layout_preset` (o es null) y que contiene claves `hero_*_pos_*`.

- [ ] **Step 2: Mostrar al usuario el SQL de migración y pedir confirmación**

```sql
-- Migración: setear preset por defecto y limpiar coordenadas legacy del hero
update public.site_config
set
	value = (value - '{
		hero_badge_pos_x,hero_badge_pos_y,
		hero_title_pos_x,hero_title_pos_y,
		hero_description_pos_x,hero_description_pos_y,
		hero_drop_message_pos_x,hero_drop_message_pos_y,
		hero_countdown_pos_x,hero_countdown_pos_y,
		hero_live_badge_pos_x,hero_live_badge_pos_y,
		hero_text_pos_x,hero_text_pos_y,
		hero_cta_pos_x,hero_cta_pos_y
	}'::text[])
		|| jsonb_build_object('layout_preset', 'fullbleed-bottom'),
	updated_at = now()
where key = 'home_hero_banner';
```

- [ ] **Step 3: Aplicar la migración vía MCP (`apply_migration`)**

Nombre de migración: `hero_fase1_preset_migration`. Aplicar el SQL del Step 2.

- [ ] **Step 4: Verificar el resultado**

```sql
select
	value->>'layout_preset' as preset,
	(value ? 'hero_title_pos_x') as has_legacy_coords
from public.site_config
where key = 'home_hero_banner';
```

Expected: `preset = 'fullbleed-bottom'`, `has_legacy_coords = false`.

- [ ] **Step 5: Commit (registro de la migración en docs, si aplica)**

No hay archivos de migración versionados en el repo; registrar la operación en el commit message del cierre o en el PR. Sin commit de código en este paso.

---

### Task 13: Verificación final de producción

**Files:** ninguno (verificación).

- [ ] **Step 1: Typecheck + lint + build limpios**

Run: `pnpm exec tsc --noEmit && pnpm lint && pnpm build`
Expected: build sin errores ni warnings críticos.

- [ ] **Step 2: Confirmar que no queda rastro del sistema legacy**

Run: `pnpm exec rg "positions|HeroElementRenderer|useHeroDragEditor|hero_\w+_pos_|RealView|CanvasPreview|HeroPositionControls" -g "*.ts" -g "*.tsx"`
Expected: sin coincidencias en `app/`, `components/`, `hooks/`, `lib/`, `types/` (solo, a lo sumo, en docs).

- [ ] **Step 3: Verificación visual responsive del hero público**

Levantar `pnpm dev`, abrir la home y revisar el hero en 320 / 375 / 768 / 1024 / 1440 px (DevTools). Para cada uno de los 4 presets (cambiándolos desde el Studio y guardando, o temporalmente vía el config):
- Sin solapes, sin overflow horizontal, sin saltos bruscos.
- Split: en mobile la imagen va arriba y el contenido abajo.
- Título ≤ 2 líneas con copy de ejemplo realista.
- La imagen del hero carga con prioridad (Network: es de las primeras; el `<img>` tiene `fetchpriority="high"`).

- [ ] **Step 4: Verificación funcional del Studio**

En `/admin` → Hero: abrir el estudio y comprobar:
- El preview coincide con el hero público para cada preset (WYSIWYG).
- Borrar la imagen de fondo deshabilita "Guardar Hero" y muestra el error.
- Escribir un subtítulo de >20 palabras muestra el contador en rojo y bloquea el guardado.
- Guardar con datos válidos persiste y refleja el preset.

- [ ] **Step 5: Verificación del config migrado**

Confirmar que el hero en producción/preview renderiza `fullbleed-bottom` sin coordenadas (Task 12 aplicada).

- [ ] **Step 6: Commit final / cierre**

```bash
git commit --allow-empty -m "chore(hero): Fase 1 verification complete (presets, validations, migration)"
```

---

## Self-Review

**Cobertura del spec:**
- Presets curados + single source of truth → Task 1, 2, 11.
- Renderer compartido / WYSIWYG → Task 4, 5, 6.
- Eliminar posicionamiento libre + migrar → Task 5, 6, 7, 8, 9, 12.
- Validaciones CMS (imagen, subtítulo, título) → Task 3, 10.
- LCP / fallback → Task 1 (`DEV_HERO_FALLBACK`, `heroImageSizes`), 5, 6.
- UX del Studio → Task 11.
- Migración DB vía MCP → Task 12.
- Verificación producción (tsc/lint/build/responsive) → Task 13.
- Fuera de alcance (focal point, contraste AA automático, framer-motion) → documentado en el spec, no en tareas.

**Placeholders:** ninguno; cada paso tiene código o comando concreto.

**Consistencia de tipos:** `HeroLayoutPreset`, `HeroTitleFontWeight`, `HeroContentAlignment` definidos en Task 1 y re-exportados en Task 2; `HeroPresetContentProps` definido en Task 4 y consumido idéntico en Task 5 y 6; `validateHeroForSave`/`countWords`/`MAX_SUBTITLE_WORDS`/`TITLE_SOFT_MAX` definidos en Task 3 y consumidos en Task 10.

**Orden de compilación:** cada tarea deja el árbol compilando (`tsc`) — los consumidores del sistema legacy se eliminan (Task 5) antes de limpiar props (Task 7), estado/tipos (Task 8) y config/action (Task 9).
