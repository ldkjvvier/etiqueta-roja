# Rediseño del buscador del header — menú flotante compacto

> **Fecha:** 2026-06-04
> **Rama:** `feat/buscador-header`
> **Reemplaza el panel de:** [2026-06-04-buscador-header-design.md](./2026-06-04-buscador-header-design.md) (la lógica se conserva; cambia solo la presentación del panel)

## Objetivo

Convertir el panel de búsqueda del header —hoy una barra a todo el ancho que cae pegada bajo el header— en un **menú flotante compacto** anclado a la derecha, que cuelga del ícono de la lupa y flota visualmente *por encima* del contenido (estética inspirada en joiamarket.com, pero en el lenguaje de Etiqueta Roja: esquinas rectas, mono, rojo de marca).

## Alcance

- **Se modifica:** `components/header-search.tsx` (solo el JSX del panel y el wrapper raíz; la lógica de estado/foco/eventos/submit no cambia).
- **No se toca:** `components/header.tsx`, `app/buscar/*`, `lib/services/*`. El header ya renderiza `<HeaderSearch />` en el cluster derecho.

## Referencia visual

```
                        ...  [🔍] [🛒 CARRITO]   ← cluster derecho del header
                              │
                    ┌─────────┴──────────────┐
                    │ 🔍 BUSCAR PRODUCTOS  ✕ │  ← panel flotante (~300px)
                    └────────────────────────┘     cuelga de la lupa, se extiende a la izquierda
```

## Requisitos de diseño

### Estructura / posicionamiento

1. El componente deja de devolver un fragmento `<>` y devuelve un **wrapper `<div className="relative">`** que envuelve el botón disparador (lupa) y el panel. El wrapper es el nuevo nodo raíz y se inserta como un único hijo flex del cluster derecho (no cambia `header.tsx`).
2. El panel se ancla al wrapper (no al header): `absolute right-0 top-full`.
3. **Separación flotante:** `mt-2` entre la barra del header y el panel, para que se lea como tarjeta suelta y no como banner pegado.
4. **Ancho compacto y fijo:** `w-[300px]`, con `max-w-[calc(100vw-2rem)]` para que nunca se desborde en viewports pequeños. El panel se extiende hacia la **izquierda** desde el borde derecho de la lupa.
5. **Flota por encima:** `z-50` + `shadow-lg`. El panel debe dibujarse sobre la `AnnouncementBar` y el contenido siguiente. Cero layout shift (sigue siendo `absolute`, no empuja nada).

### Estilo (híbrido: limpio + carácter de marca)

6. Caja del panel: `bg-background`, `border border-border-strong`, esquinas rectas (el proyecto usa `--radius: 0rem`; no agregar `rounded-*`), `shadow-lg`.
7. Input de **una sola línea**, altura compacta `h-11` (antes era `h-14`). Lupa decorativa a la izquierda (`pl-10`), botón ✕ a la derecha (`pr-10`).
8. Placeholder en **mono uppercase**: texto `Buscar productos...`, clases del input `font-mono text-xs uppercase tracking-widest`, con `placeholder:text-muted-foreground`. (Se elimina el truco anterior de `placeholder:normal-case`: ahora el placeholder sí va en uppercase para reforzar el carácter.)
9. **Detalle personal (foco rojo):** al enfocar el input, el panel marca el estado con el rojo de marca. El contenedor relativo del input lleva la clase `group`:
   - El contenedor usa `focus-within:border-brand-red` (su borde pasa a rojo cuando el input dentro tiene foco).
   - La lupa decorativa pasa de `text-muted-foreground` a `text-brand-red` vía `group-focus-within:text-brand-red` (la lupa va *antes* del input en el DOM, por eso se usa `group-focus-within` y no `peer-focus`).
   - Se reemplaza el `focus:ring-*` azulado anterior por este tratamiento rojo (sin anillo offset).
10. Animación de entrada: `animate-in fade-in zoom-in-95 slide-in-from-top-1 origin-top-right duration-150` (provisto por `tw-animate-css`, ya en uso en el proyecto). Da la sensación de "saltar" desde la lupa.

### Comportamiento (sin cambios respecto a la implementación actual)

11. Click en la lupa abre/cierra el panel (`setIsOpen((open) => !open)`).
12. Al abrir, el input recibe el foco automáticamente.
13. Enter con texto → `router.push('/buscar?q=<encodeURIComponent(trimmed)>')`. Enter vacío o solo espacios → `router.push('/buscar')`. Tras enviar, el panel se cierra y el query se limpia.
14. El panel se cierra con el botón ✕, con `Escape`, o con click/tap fuera; en los tres casos el foco vuelve a la lupa (`closePanel`).
15. Accesibilidad intacta: la lupa expone `aria-label="Buscar"`, `aria-expanded`, `aria-controls="header-search-panel"`; el panel tiene `id="header-search-panel"`; el `<form>` tiene `role="search"`; el input tiene `aria-label`; íconos decorativos con `aria-hidden`.

### Responsive

16. En mobile (~375px): la lupa y el carrito siguen cabiendo en el cluster. El panel de 300px anclado a la derecha cabe (375 − 32 de padding ≈ 343px disponibles) y, si el viewport fuese más angosto, `max-w-[calc(100vw-2rem)]` lo contiene.

## Verificación

No hay test runner en el proyecto (decisión previa, fuera de alcance). Verificación:

- `pnpm lint` — sin errores nuevos en `header-search.tsx`.
- `pnpm build` — compila y typechequea.
- Prueba manual en el navegador, checklist:
  1. La lupa abre un cuadro **compacto** (~300px) anclado a la derecha, **separado** de la barra (mt-2) y con sombra → se ve flotando sobre el contenido.
  2. El panel se dibuja **por encima** de la AnnouncementBar y del contenido (no queda tapado), sin empujar la página (cero layout shift).
  3. Al enfocar el input, el **borde y la lupa se ponen rojos** (brand-red).
  4. Placeholder en **mono uppercase**.
  5. Buscar `polera` + Enter → `/buscar?q=polera`; el panel se cierra.
  6. Enter vacío → `/buscar`.
  7. Cierra con ✕ / Escape / click-fuera; el foco vuelve a la lupa.
  8. Mobile 375px: el panel cabe y es usable.

## Fuera de alcance (YAGNI)

- Sin sugerencias/autocompletado en el panel del header (la búsqueda en vivo vive en `/buscar`).
- Sin historial de búsquedas recientes.
- Sin cambios en `header.tsx` ni en la página `/buscar`.
