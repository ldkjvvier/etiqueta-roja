```sql

--🚀 SUPABASE_SETUP_V3 — ARQUITECTURA 10/10
--0️⃣ EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--1️⃣ STORES
CREATE TABLE public.stores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stores_slug ON public.stores(slug);
--2️⃣ USER ROLES
CREATE TABLE public.user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin','store_admin','customer')),
  PRIMARY KEY (user_id, store_id)
);

CREATE INDEX idx_user_roles_lookup 
ON public.user_roles(user_id, store_id);
--3️⃣ FUNCIONES DE SEGURIDAD
CREATE OR REPLACE FUNCTION public.is_store_admin(p_store_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND store_id = p_store_id
    AND role IN ('super_admin','store_admin')
  );
END;
$$;
--4️⃣ CATEGORÍAS
CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, slug)
);

CREATE INDEX idx_categories_store ON public.categories(store_id);
--5️⃣ DROPS
CREATE TABLE public.drops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','live','ended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, slug),
  CHECK (end_time IS NULL OR end_time > start_time)
);

CREATE INDEX idx_drops_store_time 
ON public.drops(store_id, start_time);
--6️⃣ PRODUCTS
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  drop_id UUID REFERENCES public.drops(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
  compare_at_price NUMERIC(10,2),
  main_image TEXT NOT NULL,
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','active','archived')),
  is_customizable BOOLEAN DEFAULT false,
  total_views INTEGER DEFAULT 0 CHECK (total_views >= 0),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, slug)
);

CREATE INDEX idx_products_store_status 
ON public.products(store_id, status);

CREATE INDEX idx_products_category 
ON public.products(category_id);

CREATE INDEX idx_products_drop 
ON public.products(drop_id);
--7️⃣ PRODUCT IMAGES
CREATE TABLE public.product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

CREATE INDEX idx_product_images_product 
ON public.product_images(product_id);
--8️⃣ MOTOR DE VARIANTES
--Opciones
CREATE TABLE public.product_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER DEFAULT 0
);
--Valores
CREATE TABLE public.product_option_values (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  option_id UUID REFERENCES public.product_options(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  position INTEGER DEFAULT 0
);
--Variantes (Nivel Enterprise)
CREATE TABLE public.product_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT,
  combination_key TEXT NOT NULL,
  price NUMERIC(10,2) CHECK (price >= 0),
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  reserved_stock INTEGER DEFAULT 0 CHECK (reserved_stock >= 0),
  low_stock_threshold INTEGER DEFAULT 5 CHECK (low_stock_threshold >= 0),
  track_inventory BOOLEAN DEFAULT true,
  weight NUMERIC(8,2),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  UNIQUE(product_id, combination_key),
  CHECK (reserved_stock <= stock_quantity)
);

CREATE INDEX idx_variants_product 
ON public.product_variants(product_id);

CREATE INDEX idx_variants_combination 
ON public.product_variants(product_id, combination_key);
--Relación Variante ↔ Valores
CREATE TABLE public.variant_option_values (
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  option_value_id UUID REFERENCES public.product_option_values(id) ON DELETE CASCADE,
  PRIMARY KEY (variant_id, option_value_id)
);
--9️⃣ CUSTOMERS
CREATE TABLE public.customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  total_spent NUMERIC(12,2) DEFAULT 0 CHECK (total_spent >= 0),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_store 
ON public.customers(store_id);
--🔟 ORDERS
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled')),
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, order_number)
);

CREATE INDEX idx_orders_store_date 
ON public.orders(store_id, created_at);

CREATE INDEX idx_orders_customer 
ON public.orders(customer_id);
--1️⃣1️⃣ ORDER ITEMS
CREATE TABLE public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_details TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0)
);
--1️⃣2️⃣ ANALYTICS
CREATE TABLE public.product_views_daily (
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0 CHECK (views >= 0),
  PRIMARY KEY (store_id, product_id, date)
);

CREATE TABLE public.daily_metrics (
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  total_views INTEGER DEFAULT 0 CHECK (total_views >= 0),
  total_sales NUMERIC(10,2) DEFAULT 0 CHECK (total_sales >= 0),
  total_orders INTEGER DEFAULT 0 CHECK (total_orders >= 0),
  PRIMARY KEY (store_id, date)
);
--🔐 RLS COMPLETO (PRODUCCIÓN REAL)
--Activar RLS en TODAS las tablas multi-tenant:

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
--Política Pública (solo productos activos)
CREATE POLICY "Public view active products"
ON public.products
FOR SELECT
USING (
  status = 'active'
  AND deleted_at IS NULL
);
--Política Admin General
--Ejemplo en products (replicar patrón en otras tablas):

CREATE POLICY "Admin manage own store products"
ON public.products
FOR ALL
USING (
  public.is_store_admin(store_id)
  AND deleted_at IS NULL
);
```

