# Rediseño del buscador del header (menú flotante) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir el panel de `HeaderSearch` de una barra a todo el ancho a un menú flotante compacto (~300px) anclado a la derecha, que cuelga de la lupa y flota por encima del contenido, con esquinas rectas, placeholder mono uppercase y foco rojo de marca.

**Architecture:** Se reescribe **solo el `return` JSX** de `components/header-search.tsx`: el nodo raíz pasa de fragmento `<>` a un wrapper `<div className="relative">` que ancla el panel a la lupa. La lógica (estado, foco, Escape, click-fuera, submit a `/buscar?q=`) no cambia. `components/header.tsx`, `app/buscar/*` y los servicios no se tocan.

**Tech Stack:** Next.js 16 (App Router), React 19.2, TypeScript, Tailwind v4, `tw-animate-css`, `lucide-react`, componente `Button` (shadcn-style), `next/navigation`.

**Spec:** `docs/superpowers/specs/2026-06-04-buscador-flotante-redesign-design.md`

---

## Notas de verificación (leer antes de empezar)

- **No hay test runner** en el proyecto (`package.json` solo tiene `build`, `dev`, `lint`, `start`). No se agrega uno: está fuera del alcance aprobado. La verificación es **lint + build (typecheck) + prueba manual en el navegador**.
- **Package manager: `pnpm`** (npm está comprometido en el entorno del usuario). Usar siempre `pnpm`.
- **Tokens de diseño usados (confirmados en `app/globals.css` → `@theme inline`):** `border-border-strong` (de `--color-border-strong`), `border-brand-red` / `text-brand-red` (de `--color-brand-red`). El proyecto usa `--radius: 0rem`, por eso **no** se agregan clases `rounded-*`.
- **Animaciones (`tw-animate-css`):** `animate-in`, `fade-in`, `slide-in-from-top-1`, `zoom-in-95`, `duration-150`. La versión actual del componente ya usa `animate-in fade-in slide-in-from-top-2`, así que la familia está disponible. `origin-top-right` es core de Tailwind.
- **React 19.2:** `ref` se pasa como prop normal; `<Button ref={...}>` funciona porque `Button` hace spread de `...props`.

---

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `components/header-search.tsx` | **Modificado.** Se reescribe el archivo completo: misma lógica, nuevo `return` con wrapper `relative` y panel flotante compacto. |

No se tocan `components/header.tsx`, `app/buscar/*` ni `lib/services/*`.

---

## Task 1: Reescribir el `return` de `HeaderSearch` como menú flotante

**Files:**
- Modify: `components/header-search.tsx` (reemplazo del contenido completo)

- [ ] **Step 1: Reemplazar el contenido completo del archivo**

Sobrescribir `components/header-search.tsx` con exactamente este contenido (preservar la indentación con tabs). La sección de imports y toda la lógica (`closePanel`, los dos `useEffect`, `handleSubmit`) son **idénticas a la versión actual**; lo único que cambia es el bloque `return`.

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeaderSearch() {
	const router = useRouter()
	const [isOpen, setIsOpen] = useState(false)
	const [query, setQuery] = useState('')
	const inputRef = useRef<HTMLInputElement>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const panelRef = useRef<HTMLDivElement>(null)

	// Devuelve el foco al disparador y limpia el input al cerrar.
	function closePanel() {
		setIsOpen(false)
		setQuery('')
		triggerRef.current?.focus()
	}

	// Enfocar el input cuando el panel se abre.
	useEffect(() => {
		if (isOpen) inputRef.current?.focus()
	}, [isOpen])

	// Mientras está abierto: cerrar con Escape o click/tap fuera del panel.
	useEffect(() => {
		if (!isOpen) return

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') closePanel()
		}

		function handlePointerDown(event: PointerEvent) {
			const target = event.target as Node
			if (
				!panelRef.current?.contains(target) &&
				!triggerRef.current?.contains(target)
			) {
				closePanel()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		document.addEventListener('pointerdown', handlePointerDown)
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.removeEventListener('pointerdown', handlePointerDown)
		}
	}, [isOpen])

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const trimmed = query.trim()
		router.push(
			trimmed ? `/buscar?q=${encodeURIComponent(trimmed)}` : '/buscar',
		)
		setIsOpen(false)
		setQuery('')
	}

	return (
		<div ref={panelRef} className="relative">
			<Button
				ref={triggerRef}
				variant="ghost"
				size="icon"
				type="button"
				onClick={() => setIsOpen((open) => !open)}
				className="min-w-11 min-h-11 hover:bg-transparent hover:text-primary active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
				aria-label="Buscar"
				aria-expanded={isOpen}
				aria-controls="header-search-panel"
			>
				<Search className="h-5 w-5" />
				<span className="sr-only">Buscar</span>
			</Button>

			{isOpen && (
				<div
					id="header-search-panel"
					className="absolute right-0 top-full mt-2 w-[300px] max-w-[calc(100vw-2rem)] z-50 bg-background border border-border-strong shadow-lg animate-in fade-in zoom-in-95 slide-in-from-top-1 origin-top-right duration-150"
				>
					<form role="search" onSubmit={handleSubmit} className="p-3">
						<div className="group relative">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<Search
									className="w-4 h-4 text-muted-foreground group-focus-within:text-brand-red transition-colors"
									aria-hidden="true"
								/>
							</div>
							<input
								ref={inputRef}
								type="search"
								value={query}
								onChange={(event) =>
									setQuery(event.target.value)
								}
								placeholder="Buscar productos..."
								className="w-full h-11 pl-10 pr-10 bg-secondary border border-border font-mono text-xs uppercase tracking-widest placeholder:text-muted-foreground focus:outline-none focus:border-brand-red transition-colors"
								aria-label="Buscar productos"
								autoComplete="off"
							/>
							<button
								type="button"
								onClick={closePanel}
								className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
								aria-label="Cerrar búsqueda"
							>
								<X className="w-4 h-4" aria-hidden="true" />
							</button>
						</div>
					</form>
				</div>
			)}
		</div>
	)
}
```

**Qué cambió respecto a la versión actual (y por qué):**
- **Raíz `<div ref={panelRef} className="relative">`** (antes era fragmento `<>` con `panelRef` en el panel): crea el contexto de posicionamiento para anclar el panel a la lupa y envuelve toda la unidad de búsqueda. `panelRef` en el wrapper hace que el click-fuera trate botón + panel como "dentro" (el check de `triggerRef` queda redundante pero inofensivo; la lógica no se altera).
- **Panel `absolute right-0 top-full mt-2 w-[300px] max-w-[calc(100vw-2rem)] z-50 ... shadow-lg`** (antes `left-0 right-0 top-full ... border-b shadow-sm` a todo el ancho): compacto, anclado a la derecha, separado con `mt-2`, flotando con `z-50` + `shadow-lg`. Borde completo `border-border-strong` (antes solo `border-b`).
- **Sin el `<div className="container ...">` con padding de safe-area:** el panel ya no abarca el ancho del header, así que no necesita el contenedor centrado; el padding ahora es `p-3` en el `<form>`.
- **Input `h-11` (antes `h-14`), `pl-10 pr-10` (antes `pl-12 pr-12`), íconos `w-4 h-4` (antes `w-5 h-5`):** más compacto.
- **Placeholder uppercase:** se eliminan `placeholder:normal-case placeholder:tracking-normal`; ahora el placeholder hereda `uppercase tracking-widest` (mono).
- **Foco rojo:** se elimina `focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background`; el input usa `focus:border-brand-red` y la lupa `group-focus-within:text-brand-red` (el `<div>` del input lleva `group`).

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: PASS — sin errores ni warnings nuevos en `components/header-search.tsx`. (Errores preexistentes en OTROS archivos, ignorarlos.)

- [ ] **Step 3: Build (typecheck)**

Run: `pnpm build`
Expected: build exitoso. El componente compila y typechequea sin errores. (Si el build falla por errores preexistentes no relacionados con este archivo, anotarlo pero continuar.)

- [ ] **Step 4: Commit**

```bash
git add components/header-search.tsx
git commit -m "feat(header): buscador como menu flotante compacto con foco rojo"
```

---

## Task 2: Verificación manual en el navegador

**Files:** ninguno (solo verificación; si algo falla, volver a Task 1, corregir y commitear).

- [ ] **Step 1: Levantar el dev server**

Run: `pnpm dev`
Abrir `http://localhost:3000`.

- [ ] **Step 2: Verificar el comportamiento (checklist)**

Comprobar cada punto:

1. **Compacto + flotante:** click en la lupa → aparece un cuadro **angosto (~300px)** anclado a la derecha (debajo de la lupa), **separado** de la barra del header (hay un pequeño gap, `mt-2`) y con **sombra** → se ve como tarjeta flotando, no como banner pegado. El input recibe el foco automáticamente.
2. **Por encima del contenido:** el panel se dibuja **sobre** la `AnnouncementBar` y el contenido siguiente (no queda tapado) y **no empuja** la página (cero layout shift).
3. **Foco rojo:** al enfocar el input, su **borde** y la **lupa interna** pasan a **rojo de marca** (`brand-red`).
4. **Placeholder mono uppercase:** el placeholder dice `BUSCAR PRODUCTOS...` en mono, mayúsculas, con tracking ancho.
5. **Buscar:** escribir `polera` + Enter → navega a `/buscar?q=polera`; el panel se cierra.
6. **Query vacío:** abrir, Enter sin escribir (o solo espacios) → navega a `/buscar`.
7. **Cerrar con ✕ / Escape / click fuera:** en los tres casos el panel se cierra; con ✕ y Escape el foco vuelve a la lupa.
8. **Mobile (~375px):** reducir el viewport (DevTools). La lupa y el carrito caben; el panel de 300px cabe anclado a la derecha y es usable (no se desborda).

- [ ] **Step 3: Accesibilidad rápida**

Con el teclado (Tab): llegar a la lupa, abrir con Enter/Espacio, el foco entra al input; `Escape` cierra y devuelve el foco a la lupa. Verificar en el inspector que la lupa expone `aria-expanded` cambiando de `false` a `true`.

- [ ] **Step 4: Detener el dev server**

`Ctrl+C` en la terminal del dev server.

---

## Self-Review (completado por el autor del plan)

- **Cobertura del spec:**
  - Estructura wrapper `relative` + panel `absolute right-0 top-full` (req. 1-2) → Task 1. ✔
  - `mt-2` flotante (req. 3) → Task 1; verificado Task 2 paso 1. ✔
  - Ancho compacto `w-[300px]` + `max-w-[calc(100vw-2rem)]` (req. 4) → Task 1; verificado paso 1 y 8. ✔
  - Flota por encima `z-50` + `shadow-lg`, cero layout shift (req. 5) → Task 1; verificado paso 2. ✔
  - Caja `bg-background border-border-strong`, esquinas rectas (req. 6) → Task 1. ✔
  - Input `h-11`, lupa izq `pl-10`, ✕ der `pr-10` (req. 7) → Task 1. ✔
  - Placeholder mono uppercase (req. 8) → Task 1; verificado paso 4. ✔
  - Foco rojo: `focus:border-brand-red` + `group-focus-within:text-brand-red` (req. 9) → Task 1; verificado paso 3. ✔
  - Animación `fade-in zoom-in-95 slide-in-from-top-1 origin-top-right duration-150` (req. 10) → Task 1. ✔
  - Comportamiento sin cambios (req. 11-15): abrir/cerrar, foco auto, submit, ✕/Escape/click-fuera, accesibilidad → lógica idéntica en Task 1; verificado Task 2 pasos 5-7 y 3. ✔
  - Responsive 375px (req. 16) → `max-w` en Task 1; verificado paso 8. ✔
  - No tocar `header.tsx`/`app/buscar`/servicios → solo se modifica `header-search.tsx`. ✔
- **Placeholder scan:** sin TBD/TODO; código completo y literal.
- **Type/naming consistency:** `closePanel`, `handleSubmit`, `handleKeyDown`, `handlePointerDown`, refs `inputRef`/`triggerRef`/`panelRef`, `id="header-search-panel"` (coincide con `aria-controls`) — consistentes y sin cambios respecto a la versión que ya integra `header.tsx`.

---

## Execution Handoff

Ver la sección de handoff que presentará el asistente tras guardar el plan.
