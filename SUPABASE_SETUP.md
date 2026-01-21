# Configuración de Supabase para Etiqueta Roja (V2 - Estructura Escalable)

Sigue estos pasos para configurar tu proyecto en Supabase con la arquitectura profesional de E-commerce.

## 1. Crear Proyecto
Ve a [Supabase](https://supabase.com/) y crea un nuevo proyecto.

## 2. Ejecutar SQL
Ve al **SQL Editor** en tu dashboard de Supabase.

> **Importante:** Si estás migrando desde la V1, deberás respaldar y borrar tus tablas antiguas (`products`) antes de ejecutar esto, o migrar los datos manualmente.

Ejecuta el siguiente script completo:

```sql
-- ==========================================
-- 1. Tablas Base (Categorías y Configuración)
-- ==========================================

-- Tabla de Categorías
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null unique,
  slug text not null unique,
  description text,
  image text
);

-- Tabla de Configuración Global (Banners, Contacto, Redes)
create table if not exists public.site_config (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  value jsonb not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 2. Tablas Principales (Productos e Inventario)
-- ==========================================

-- Tabla de Productos (Catálogo)
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  price numeric not null,
  original_price numeric,
  image text not null, -- URL de imagen principal (Portada)
  images text[] default array[]::text[], -- URLs de galería adicional
  description text,
  category_id uuid references public.categories(id) on delete set null
);

-- Tabla de Variantes (Inventario por Talla)
create table if not exists public.product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  size text not null, -- Ej: 'S', 'M', 'XL', '42'
  stock_quantity integer default 0 not null,
  sku text -- Código único opcional
);

-- Habilitar Seguridad (RLS) en todas las tablas
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.site_config enable row level security;

-- ==========================================
-- 3. Políticas de Seguridad (RLS)
-- ==========================================

-- LECTURA PÚBLICA (Todos ven el catálogo)
create policy "Public view categories" on public.categories for select using (true);
create policy "Public view products" on public.products for select using (true);
create policy "Public view variants" on public.product_variants for select using (true);
create policy "Public view config" on public.site_config for select using (true);

-- ESCRITURA ADMIN (Solo autenticados editan)
-- Categorías
create policy "Admin manage categories" on public.categories for all using (auth.role() = 'authenticated');
-- Productos
create policy "Admin manage products" on public.products for all using (auth.role() = 'authenticated');
-- Variantes
create policy "Admin manage variants" on public.product_variants for all using (auth.role() = 'authenticated');
-- Configuración
create policy "Admin manage config" on public.site_config for all using (auth.role() = 'authenticated');

-- ==========================================
-- 4. Configuración de Storage (Imágenes)
-- ==========================================
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

create policy "Public view images" on storage.objects for select using ( bucket_id = 'products' );
create policy "Admin upload images" on storage.objects for insert with check ( bucket_id = 'products' and auth.role() = 'authenticated' );
create policy "Admin update images" on storage.objects for update using ( bucket_id = 'products' and auth.role() = 'authenticated' );
create policy "Admin delete images" on storage.objects for delete using ( bucket_id = 'products' and auth.role() = 'authenticated' );

-- ==========================================
-- 5. Datos Iniciales (Seed Data)
-- ==========================================

-- Configuración Inicial
insert into public.site_config (key, value, is_active)
values
  ('promo_banner', '{"message": "ENVÍO GRATIS EN PEDIDOS +$100 ★ DROP LIMITADO", "link": null}'::jsonb, true),
  ('contact_info', '{"whatsapp": "+56912345678", "instagram": "@etiquetaroja"}'::jsonb, true)
on conflict (key) do nothing;

-- Categoría Ejemplo
insert into categories (name, slug) values 
('Streetwear', 'streetwear'),
('Accesorios', 'accesorios')
on conflict (slug) do nothing;

-- NOTA: Para insertar productos de prueba, usa la interfaz gráfica o un script específico una vez tengas los IDs de las categorías.
```

## 3. Variables de Entorno
Crea un archivo `.env.local` en la raíz de tu proyecto.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## 4. Estructura de Datos Explicada

### `products`
Esta tabla contiene la información "estática" y de marketing del producto.
- `image`: Es la portada. SIEMPRE debe tener valor.
- `images`: Array de fotos extra para la galería.

### `product_variants`
Aquí vive el stock real.
- Si un producto tiene tallas S y M, tendrás 2 filas aquí vinculadas al mismo `product_id`.
- El frontend suma automáticamente `stock_quantity` de todas las variantes para saber si el producto está "Agotado" o "Disponible".

-- ==========================================
-- 5. Actualización de Políticas de Storage
-- ==========================================

-- Permitir a usuarios autenticados (admin) ACTUALIZAR y ELIMINAR imágenes
create policy "Admin update images" on storage.objects for update with check ( bucket_id = 'products' and auth.role() = 'authenticated' );
create policy "Admin delete images" on storage.objects for delete using ( bucket_id = 'products' and auth.role() = 'authenticated' );

