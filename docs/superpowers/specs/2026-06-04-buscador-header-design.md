# Diseño — Buscador expandible en el header

> **Fecha:** 2026-06-04
> **Estado:** Aprobado (diseño)
> **Alcance:** Agregar un buscador en la barra del header que, al enviar una búsqueda, navegue a `/buscar?q=...`

---

## Contexto

La página `/buscar` ya existe y es funcional por sí sola:

- `app/buscar/page.tsx` — server component que lee `?q=` y precarga resultados con `getProducts({ q, pageSize: 24 })`.
- `app/buscar/search-page-client.tsx` — input de búsqueda **autoenfocado** con búsqueda en vivo (debounce 350ms) que actualiza la URL y los resultados a medida que se escribe.
- `app/buscar/actions.ts` — server action `searchProductsAction(q)`.

El header (`components/header.tsx`) es un client component con un grid de 3 columnas (nav izquierda, logo centrado, carrito derecha) y **no tiene buscador**.

**Problema:** no hay forma de iniciar una búsqueda desde el resto del sitio; el usuario solo puede buscar si llega manualmente a `/buscar`.

## Decisión

Agregar un **input expandible** en el header: un ícono de lupa que al tocarlo despliega una barra de búsqueda. Al presionar Enter, navega a `/buscar?q=...`, donde la búsqueda en vivo ya existente toma el control.

El panel se muestra como **dropdown overlay** (posicionado absoluto, cuelga debajo de la barra del header) para lograr **cero layout shift** — no empuja el contenido de la página.

No se modifica `app/buscar/*` ni `lib/services/products-server.ts`: la página de búsqueda ya maneja el prefill desde `?q=` y los resultados en vivo. El trabajo es enteramente en el header.

## Diseño detallado

### Componentes

**Nuevo — `components/header-search.tsx`** (client component)

Encapsula todo el buscador para no inflar `header.tsx` (~300 líneas). Renderiza dos elementos hermanos:

1. **Botón disparador** (lupa): se ubica en el cluster derecho del header, *antes* del carrito, tanto en mobile como en desktop.
2. **Panel expandible**: un `<form role="search">` de ancho completo, posicionado `absolute left-0 right-0 top-full`, que cuelga justo debajo de la barra del header como un dropdown. Contiene:
   - `<input type="search">` con el término de búsqueda.
   - Botón de cerrar / limpiar (✕).

Como el panel es `absolute`, no participa en el flujo del grid → no hay layout shift. El `<header>` ya es `sticky` (contexto posicionado), por lo que `top-full` posiciona el panel inmediatamente debajo de la barra.

**Modificado — `components/header.tsx`**

- Un `import` de `HeaderSearch`.
- Renderizar `<HeaderSearch />` en el cluster derecho (junto al carrito).
- Sin reestructurar el grid de 3 columnas: el panel se posiciona respecto al `<header>`, no respecto a la celda del grid.

### Estado e interacción

Estado local en `HeaderSearch`:

- `isOpen: boolean` — si el panel está desplegado.
- `query: string` — texto del input.

Flujo:

- **Abrir** (tap lupa): `isOpen = true`; el input recibe foco automáticamente.
- **Enviar** (Enter / submit del form):
  - `const trimmed = query.trim()`
  - `router.push(trimmed ? '/buscar?q=' + encodeURIComponent(trimmed) : '/buscar')`
  - Colapsar (`isOpen = false`) y limpiar (`query = ''`).
- **Cerrar** sin buscar: tecla `Escape`, botón ✕, o click fuera del panel → `isOpen = false` y el foco vuelve al botón lupa.

### Navegación y reuso

Navegación con `useRouter().push` de `next/navigation`. `/buscar` ya:

- Lee `?q=` en el server component.
- Precarga el input y ejecuta la búsqueda en vivo en `search-page-client.tsx`.

No se requieren cambios en la página de búsqueda ni en los servicios.

### Accesibilidad

Alineado a los patrones que ya usa el header:

- **Botón lupa:** `aria-label="Buscar"`, `aria-expanded={isOpen}`, `aria-controls` apuntando al panel, tap target mínimo 44px (`min-w-11 min-h-11`), `focus-visible` outline como los demás botones.
- **Panel:** `<form role="search">`; el input con `aria-label="Buscar productos"`.
- **Manejo de foco:** mover el foco al input al abrir; devolverlo al botón lupa al cerrar.
- **Teclado:** `Escape` cierra el panel.

### Edge cases

- **Query vacío o solo espacios:** navega a `/buscar` sin `?q=` (muestra todos los productos).
- **Click fuera:** cierra el panel (listener en `document`, registrado solo mientras `isOpen`).
- **Ya en `/buscar`:** el header search sigue navegando con el nuevo `?q=`; comportamiento aceptable. El input en vivo de la página es la fuente principal de búsqueda una vez ahí.

## Fuera de alcance (YAGNI)

- Autocompletado / sugerencias en el header.
- Búsquedas recientes.
- Atajo de teclado Cmd/Ctrl+K.
- Filtros por categoría desde el header.

El input del header solo captura texto y navega; la búsqueda en vivo ya vive en `/buscar`.

## Verificación

Verificación manual:

- Abrir y cerrar el panel (lupa, ✕, Escape, click fuera).
- Enter navega a `/buscar` con el `?q=` correcto y codificado.
- Query vacío navega a `/buscar` sin parámetro.
- Foco: al input al abrir, al botón al cerrar.
- Layout correcto en mobile y desktop, sin layout shift al abrir.

Durante la planificación se revisará si existe infraestructura de tests automatizados en el proyecto para agregar cobertura.

## Archivos afectados

| Archivo | Cambio |
|---|---|
| `components/header-search.tsx` | **Nuevo** — buscador expandible (botón + panel overlay) |
| `components/header.tsx` | Modificado — import + render de `<HeaderSearch />` en el cluster derecho |
