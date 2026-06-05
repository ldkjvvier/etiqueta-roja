# Buscador expandible en el header — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar un ícono de búsqueda en el header que despliega un input; al enviar, navega a `/buscar?q=...`.

**Architecture:** Un nuevo client component `HeaderSearch` encapsula un botón disparador (lupa) y un panel `<form>` posicionado en `absolute` que cuelga debajo de la barra del header (dropdown overlay, cero layout shift). El header solo importa y renderiza `<HeaderSearch />` en su cluster derecho. La página `/buscar` ya existe y maneja el prefill desde `?q=` y la búsqueda en vivo, por lo que no se modifica.

**Tech Stack:** Next.js 16 (App Router), React 19.2, TypeScript, Tailwind v4, `tw-animate-css`, `lucide-react`, componente `Button` (shadcn-style), `next/navigation`.

---

## Notas de verificación (leer antes de empezar)

- **No hay test runner** en el proyecto (`package.json` solo tiene `build`, `dev`, `lint`, `start`). No se agrega uno: sería desproporcionado para un componente y está fuera del alcance aprobado. La verificación es **lint + typecheck (build) + prueba manual en el navegador**.
- **Package manager: `pnpm`** (npm está comprometido en el entorno del usuario). Usar siempre `pnpm`.
- **React 19.2:** el `ref` se pasa como prop normal a componentes de función. `<Button ref={...}>` funciona porque `Button` hace spread de `...props` sobre el elemento DOM; no se necesita `forwardRef`.
- El componente sigue los patrones de estilo ya presentes en `components/header.tsx` (clases `min-w-11 min-h-11`, `focus-visible:outline-*`) y reutiliza el estilo del input de `app/buscar/search-page-client.tsx`.

---

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `components/header-search.tsx` | **Nuevo.** Todo el buscador del header: estado (`isOpen`, `query`), botón disparador, panel overlay con `<form>`, manejo de foco, Escape y click-fuera, navegación a `/buscar`. |
| `components/header.tsx` | **Modificado.** Importa y renderiza `<HeaderSearch />` en el cluster derecho (antes del carrito). Sin reestructurar el grid. |

No se tocan `app/buscar/*` ni `lib/services/products-server.ts`.

---

## Task 1: Crear el componente `HeaderSearch`

**Files:**
- Create: `components/header-search.tsx`

- [ ] **Step 1: Crear el archivo con el componente completo**

Crear `components/header-search.tsx` con exactamente este contenido:

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
				setIsOpen(false)
				setQuery('')
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
		<>
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
					ref={panelRef}
					id="header-search-panel"
					className="absolute left-0 right-0 top-full bg-background border-b border-border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200"
				>
					<div
						className="container mx-auto"
						style={{
							paddingLeft: 'max(1rem, env(safe-area-inset-left))',
							paddingRight: 'max(1rem, env(safe-area-inset-right))',
						}}
					>
						<form
							role="search"
							onSubmit={handleSubmit}
							className="py-4"
						>
							<div className="relative">
								<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
									<Search
										className="w-5 h-5 text-muted-foreground"
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
									className="w-full h-14 pl-12 pr-12 bg-secondary border border-border font-mono text-sm uppercase tracking-widest placeholder:text-muted-foreground placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors"
									aria-label="Buscar productos"
									autoComplete="off"
								/>
								<button
									type="button"
									onClick={closePanel}
									className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
									aria-label="Cerrar búsqueda"
								>
									<X className="w-4 h-4" aria-hidden="true" />
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	)
}
```

**Por qué funciona el posicionamiento:** el panel usa `absolute left-0 right-0 top-full`. El ancestro posicionado más cercano es el `<header>` (que es `sticky`, lo que crea contexto de posicionamiento). Los divs intermedios (container, grid, cluster) son `static`. Por eso `top-full` (top: 100%) coloca el panel justo debajo de la barra del header y `left-0 right-0` lo extiende a todo el ancho del header, sin importar que el botón viva dentro de la celda derecha del grid.

- [ ] **Step 2: Lint del archivo nuevo**

Run: `pnpm lint`
Expected: PASS — sin errores ni warnings nuevos en `components/header-search.tsx`. (Si aparecen errores preexistentes en OTROS archivos, ignorarlos; solo importan los del archivo nuevo.)

- [ ] **Step 3: Commit**

```bash
git add components/header-search.tsx
git commit -m "feat(header): componente HeaderSearch (buscador expandible)"
```

---

## Task 2: Conectar `HeaderSearch` al header

**Files:**
- Modify: `components/header.tsx` (import cerca de la línea 15; render en el cluster derecho, líneas ~234-294)

- [ ] **Step 1: Agregar el import**

En `components/header.tsx`, junto a los otros imports de componentes locales (después de `import { CartSheet } from './cart-sheet'`, línea 15), agregar:

```tsx
import { HeaderSearch } from './header-search'
```

El bloque de imports debe quedar así:

```tsx
import { useStore } from '@/lib/store-context'
import { CartSheet } from './cart-sheet'
import { HeaderSearch } from './header-search'
import { cn } from '@/lib/utils'
```

- [ ] **Step 2: Renderizar `<HeaderSearch />` en el cluster derecho**

En `components/header.tsx`, reemplazar la apertura del cluster derecho. Buscar este bloque (línea ~234):

```tsx
					{/* RIGHT — Cart */}
					<div className="flex items-center justify-end">
						{/* Mobile: icon-only */}
```

y reemplazarlo por:

```tsx
					{/* RIGHT — Search + Cart */}
					<div className="flex items-center justify-end gap-1">
						<HeaderSearch />
						{/* Mobile: icon-only */}
```

(Se agrega `gap-1` para separar la lupa del carrito y se inserta `<HeaderSearch />` como primer hijo, de modo que la lupa aparezca a la izquierda del carrito tanto en mobile como en desktop. El resto del cluster queda igual.)

- [ ] **Step 3: Lint + typecheck**

Run: `pnpm lint`
Expected: PASS — sin errores nuevos.

Run: `pnpm build`
Expected: build exitoso (Next.js compila y typechequea). El componente nuevo y el header deben compilar sin errores de tipos. (Si el build falla por errores preexistentes no relacionados con estos dos archivos, anotarlo pero continuar.)

- [ ] **Step 4: Commit**

```bash
git add components/header.tsx
git commit -m "feat(header): integrar HeaderSearch en el cluster derecho"
```

---

## Task 3: Verificación manual en el navegador

**Files:** ninguno (solo verificación; si algo falla, volver a Task 1/2, corregir y commitear).

- [ ] **Step 1: Levantar el dev server**

Run: `pnpm dev`
Abrir `http://localhost:3000`.

- [ ] **Step 2: Verificar el comportamiento (checklist)**

Comprobar cada punto:

1. **Abrir:** la lupa aparece a la izquierda del carrito. Al hacer click, se despliega el panel justo debajo del header, a todo el ancho, **sin empujar el contenido** de la página (cero layout shift). El input recibe el foco automáticamente.
2. **Buscar:** escribir un término (ej. `polera`) y presionar Enter → navega a `/buscar?q=polera`. La página de búsqueda muestra el input precargado con el término y los resultados. El panel del header se cierra.
3. **Query vacío:** abrir, no escribir nada (o solo espacios), Enter → navega a `/buscar` (muestra todos los productos).
4. **Cerrar con ✕:** abrir, click en el botón ✕ → el panel se cierra y el foco vuelve a la lupa.
5. **Cerrar con Escape:** abrir, presionar `Escape` → el panel se cierra y el foco vuelve a la lupa.
6. **Cerrar con click fuera:** abrir, click en cualquier parte fuera del panel → el panel se cierra.
7. **Mobile:** reducir el viewport (DevTools, ~375px). La lupa y el carrito caben en el cluster derecho. El panel se abre a todo el ancho y es usable.
8. **Encima del contenido:** el panel se dibuja por encima de la `AnnouncementBar` y del contenido siguiente (no queda tapado).

- [ ] **Step 3: Accesibilidad rápida**

Con el teclado (Tab): llegar a la lupa, abrir con Enter/Espacio, el foco entra al input; `Escape` cierra y devuelve el foco a la lupa. Verificar que el botón lupa expone `aria-expanded` (cambia de `false` a `true`) en el inspector.

- [ ] **Step 4: Detener el dev server**

`Ctrl+C` en la terminal del dev server.

---

## Self-Review (completado por el autor del plan)

- **Cobertura del spec:**
  - "Input expandible (lupa → panel)" → Task 1 (botón + panel). ✔
  - "Enter navega a `/buscar?q=...`" → Task 1 `handleSubmit`. ✔
  - "Query vacío → `/buscar`" → Task 1 `handleSubmit` (rama sin `q`); verificado en Task 3. ✔
  - "Dropdown overlay, cero layout shift" → Task 1 panel `absolute ... top-full`; verificado en Task 3 paso 2.1. ✔
  - "Cerrar con Escape / ✕ / click fuera, foco de vuelta al disparador" → Task 1 `closePanel` + efecto de Escape/pointerdown; verificado en Task 3. ✔
  - "Accesibilidad (aria-label, aria-expanded, aria-controls, role=search, manejo de foco)" → Task 1; verificado en Task 3 paso 3. ✔
  - "No tocar `app/buscar/*` ni servicios" → respetado; solo Task 1 (nuevo) y Task 2 (header). ✔
  - "HeaderSearch en su propio archivo para no inflar header.tsx" → Task 1. ✔
- **Placeholder scan:** sin TBD/TODO; todo el código está completo y literal.
- **Type/naming consistency:** `closePanel`, `handleSubmit`, `handleKeyDown`, `handlePointerDown`, refs `inputRef`/`triggerRef`/`panelRef` y `id="header-search-panel"` (coincide con `aria-controls`) son consistentes entre Task 1 y Task 2.

---

## Execution Handoff

Ver la sección de handoff que presentará el asistente tras guardar el plan.
