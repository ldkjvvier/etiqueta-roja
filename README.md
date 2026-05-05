# Etiqueta Roja — E-commerce

Plataforma de e-commerce para la marca **Etiqueta Roja**, construida con Next.js, Supabase y Tailwind CSS. Lista para producción.

## Stack tecnológico

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **Base de datos / Auth:** Supabase (PostgreSQL + Row Level Security)
- **Estilos:** Tailwind CSS v4 + shadcn/ui
- **Deploy:** Vercel
- **Analíticas:** Vercel Analytics

## Requisitos previos

- Node.js ≥ 18
- pnpm ≥ 8
- Proyecto en Supabase con las tablas y políticas configuradas (ver [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md))

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

## Instalación y desarrollo

```bash
pnpm install
pnpm dev
```

La app estará disponible en `http://localhost:3000`.

## Build de producción

```bash
pnpm build
pnpm start
```

## Estructura del proyecto

```
app/          # Rutas y layouts (App Router)
components/   # Componentes reutilizables (UI + dominio)
hooks/        # Custom hooks de React
lib/          # Utilidades, servicios y configuración
services/     # Lógica de negocio y acceso a datos
types/        # Definiciones de tipos TypeScript
public/       # Assets estáticos
styles/       # Estilos globales
```

## Deploy

El proyecto está configurado para desplegarse automáticamente en **Vercel** al hacer push a la rama principal.

Consulta la [documentación de Vercel para Next.js](https://vercel.com/docs/frameworks/nextjs) para más detalles.

## Base de datos

Revisa [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) y [`SUPABASE_POLICY_SETUP.md`](./SUPABASE_POLICY_SETUP.md) para la configuración completa de tablas y políticas de seguridad.