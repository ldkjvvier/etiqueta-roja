# Configuración de Supabase para Etiqueta Roja

Sigue estos pasos para configurar tu proyecto en Supabase.

## 1. Crear Proyecto
Ve a [Supabase](https://supabase.com/) y crea un nuevo proyecto.

## 2. Ejecutar SQL
Ve al **SQL Editor** en tu dashboard de Supabase y ejecuta el siguiente script para crear la tabla de productos y configurar la seguridad.

```sql
-- Crear tabla de productos
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  price numeric not null,
  original_price numeric,
  image text not null,
  images text[] default array[]::text[],
  sizes text[] default array[]::text[],
  stock_status text check (stock_status in ('available', 'low', 'sold_out')),
  category text,
  description text
);

-- Habilitar Row Level Security (RLS)
alter table public.products enable row level security;

-- Política de lectura: Todo el mundo puede ver productos
drop policy if exists "Public products are viewable by everyone" on public.products;
create policy "Public products are viewable by everyone"
  on public.products for select
  using ( true );

-- Política de escritura: Solo usuarios autenticados (admins) pueden modificar
drop policy if exists "Authenticated users can insert products" on public.products;
create policy "Authenticated users can insert products"
  on public.products for insert
  with check ( auth.role() = 'authenticated' );

drop policy if exists "Authenticated users can update products" on public.products;
create policy "Authenticated users can update products"
  on public.products for update
  using ( auth.role() = 'authenticated' );

drop policy if exists "Authenticated users can delete products" on public.products;
create policy "Authenticated users can delete products"
  on public.products for delete
  using ( auth.role() = 'authenticated' );

-- Configurar Storage para imágenes
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Política de Storage: Acceso público de lectura
drop policy if exists "Give public access to product images" on storage.objects;
create policy "Give public access to product images"
  on storage.objects for select
  using ( bucket_id = 'products' );

-- Política de Storage: Acceso de escritura para admins
drop policy if exists "Authenticated users can upload product images" on storage.objects;
create policy "Authenticated users can upload product images"
  on storage.objects for insert
  with check ( bucket_id = 'products' and auth.role() = 'authenticated' );
  
drop policy if exists "Authenticated users can update product images" on storage.objects;
create policy "Authenticated users can update product images"
  on storage.objects for update
  using ( bucket_id = 'products' and auth.role() = 'authenticated' );

drop policy if exists "Authenticated users can delete product images" on storage.objects;
create policy "Authenticated users can delete product images"
  on storage.objects for delete
  using ( bucket_id = 'products' and auth.role() = 'authenticated' );

-- Crear tabla de configuración del sitio (banner, redes sociales, etc.)
create table if not exists public.site_config (
  id uuid default gen_random_uuid() primary key,
  key text unique not null, -- 'promo_banner', 'contact_info', etc.
  value jsonb not null, -- Contenido flexible en formato JSON
  is_active boolean default true, -- Para activar/desactivar features globalmente
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS para config
alter table public.site_config enable row level security;

-- Política de lectura pública para config
drop policy if exists "Site config is viewable by everyone" on public.site_config;
create policy "Site config is viewable by everyone"
  on public.site_config for select
  using ( true );

-- Política de escritura solo para admins
drop policy if exists "Authenticated users can update site config" on public.site_config;
create policy "Authenticated users can update site config"
  on public.site_config for update
  using ( auth.role() = 'authenticated' );

drop policy if exists "Authenticated users can insert site config" on public.site_config;
create policy "Authenticated users can insert site config"
  on public.site_config for insert
  with check ( auth.role() = 'authenticated' );

-- Datos iniciales (Seed)
insert into public.site_config (key, value, is_active)
values
  (
    'promo_banner',
    '{
      "message": "ENVÍO GRATIS EN PEDIDOS +$100 ★ DROP LIMITADO ★ NO RESTOCK",
      "show_whatsapp_icon": true,
      "link": null
    }'::jsonb,
    true
  ),
  (
    'contact_info',
    '{
      "whatsapp": "+56912345678",
      "instagram": "https://instagram.com/etiquetaroja",
      "tiktok": "https://tiktok.com/@etiquetaroja",
      "email": "contacto@etiquetaroja.com"
    }'::jsonb,
    true
  )
on conflict (key) do nothing;
```

## 3. Variables de Entorno
Crea un archivo `.env.local` en la raíz de tu proyecto (si no existe) y agrega las credenciales de tu proyecto Supabase (disponibles en Project Settings > API).

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

En **Vercel**, agrega estas mismas variables en la sección de Settings > Environment Variables.

## 4. Usuarios
Para gestionar la web, registra un usuario desde el panel de Supabase (Authentication > Users > Add User) o usa el formulario de login que hemos creado (si habilitas el registro público, asegúrate de restringir las políticas de escritura solo a tu email).

## 5. Imágenes y Plan Gratuito
El plan gratuito de Supabase incluye 1GB de almacenamiento.
- **Recomendación**: Sube imágenes optimizadas (WebP o JPG comprimido, máximo 1500px de ancho).
- No subas imágenes "crudas" de cámara (que pueden pesar 5-10MB). Intenta mantenerlas bajo 200KB.
