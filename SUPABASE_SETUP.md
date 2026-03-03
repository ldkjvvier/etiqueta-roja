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

-- ==========================================
-- 6. Actualización de Políticas de Storage y Analytics
-- ==========================================

-- Permitir a usuarios autenticados (admin) ACTUALIZAR y ELIMINAR imágenes (Reasegura permisos)
drop policy if exists "Admin update images" on storage.objects;
create policy "Admin update images" on storage.objects for update with check ( bucket_id = 'products' and auth.role() = 'authenticated' );

drop policy if exists "Admin delete images" on storage.objects;
create policy "Admin delete images" on storage.objects for delete using ( bucket_id = 'products' and auth.role() = 'authenticated' );

-- Tabla para guardar vistas por día (Histórico)
create table if not exists public.product_views_daily (
  product_id uuid references public.products(id) on delete cascade not null,
  date date default current_date not null,
  views integer default 0 not null,
  primary key (product_id, date)
);

-- Habilitar RLS para vistas
alter table public.product_views_daily enable row level security;
create policy "Public view daily stats" on public.product_views_daily for select using (true);

-- Asegurar que existe la columnas 'views' en 'products' para acceso rápido (Total)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Función optimizada (Actualiza ambos contadores)
CREATE OR REPLACE FUNCTION increment_product_view(p_product_id UUID)
RETURNS VOID AS $$
BEGIN
  -- A. Insertar o Actualizar conteo del día (Granular)
  INSERT INTO public.product_views_daily (product_id, date, views)
  VALUES (p_product_id, CURRENT_DATE, 1)
  ON CONFLICT (product_id, date)
  DO UPDATE SET views = product_views_daily.views + 1;

  -- B. Actualizar conteo total en tabla principal (Lectura rápida)
  UPDATE public.products
  SET views = COALESCE(views, 0) + 1
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

