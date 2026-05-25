-- ============================================================
-- SCHEMA COMPLETO PARA PRODUCCIÓN
-- Target: Supabase (PostgreSQL 15+)
-- Instrucciones:
--   1. En Supabase → SQL Editor → pegar y ejecutar este archivo completo.
--   2. Si ya existe data vieja: Table Editor → borrar tablas manualmente,
--      o correr el bloque DROP al final de este archivo primero.
-- ============================================================

-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- FUNCIÓN UTILITARIA: auto-actualizar updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ============================================================
-- TABLA: stores
-- ============================================================
CREATE TABLE public.stores (
  id          uuid        NOT NULL DEFAULT uuid_generate_v4(),
  owner_id    uuid                 REFERENCES auth.users(id) ON DELETE SET NULL,
  name        text        NOT NULL,
  slug        text        NOT NULL,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT stores_pkey        PRIMARY KEY (id),
  CONSTRAINT stores_slug_unique UNIQUE (slug)
);

CREATE TRIGGER trg_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_stores_is_active ON public.stores (is_active);


-- ============================================================
-- TABLA: user_roles
-- ============================================================
CREATE TABLE public.user_roles (
  user_id    uuid        NOT NULL REFERENCES auth.users(id)    ON DELETE CASCADE,
  store_id   uuid        NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  role       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_pkey        PRIMARY KEY (user_id, store_id),
  CONSTRAINT user_roles_role_check  CHECK (role = ANY (ARRAY['super_admin','store_admin','customer']))
);

CREATE INDEX idx_user_roles_user_id  ON public.user_roles (user_id);
CREATE INDEX idx_user_roles_store_id ON public.user_roles (store_id);


-- ============================================================
-- TABLA: categories
-- ============================================================
CREATE TABLE public.categories (
  id          uuid        NOT NULL DEFAULT uuid_generate_v4(),
  store_id    uuid        NOT NULL REFERENCES public.stores(id) ON DELETE RESTRICT,
  name        text        NOT NULL,
  slug        text        NOT NULL,
  description text,
  image_url   text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categories_pkey             PRIMARY KEY (id),
  CONSTRAINT categories_store_slug_unique UNIQUE (store_id, slug)
);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_categories_store_id ON public.categories (store_id);


-- ============================================================
-- TABLA: drops
-- ============================================================
CREATE TABLE public.drops (
  id           uuid        NOT NULL DEFAULT uuid_generate_v4(),
  store_id     uuid        NOT NULL REFERENCES public.stores(id) ON DELETE RESTRICT,
  name         text        NOT NULL,
  slug         text        NOT NULL,
  description  text,
  cover_image  text,
  start_time   timestamptz NOT NULL,
  end_time     timestamptz,
  status       text        NOT NULL DEFAULT 'scheduled',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT drops_pkey             PRIMARY KEY (id),
  CONSTRAINT drops_store_slug_unique UNIQUE (store_id, slug),
  CONSTRAINT drops_status_check     CHECK (status = ANY (ARRAY['scheduled','live','ended'])),
  CONSTRAINT drops_end_after_start  CHECK (end_time IS NULL OR end_time > start_time)
);

CREATE TRIGGER trg_drops_updated_at
  BEFORE UPDATE ON public.drops
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_drops_store_id ON public.drops (store_id);
CREATE INDEX idx_drops_status   ON public.drops (store_id, status);


-- ============================================================
-- TABLA: customers
-- ============================================================
CREATE TABLE public.customers (
  id           uuid        NOT NULL DEFAULT uuid_generate_v4(),
  store_id     uuid        NOT NULL REFERENCES public.stores(id) ON DELETE RESTRICT,
  auth_user_id uuid                 REFERENCES auth.users(id) ON DELETE SET NULL,
  email        text        NOT NULL,
  first_name   text,
  last_name    text,
  phone        text,
  total_spent  numeric     NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
  deleted_at   timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customers_pkey               PRIMARY KEY (id),
  CONSTRAINT customers_store_email_unique UNIQUE (store_id, email)
);

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_customers_store_id   ON public.customers (store_id);
CREATE INDEX idx_customers_auth_user  ON public.customers (auth_user_id);
CREATE INDEX idx_customers_active     ON public.customers (store_id) WHERE deleted_at IS NULL;


-- ============================================================
-- TABLA: products
-- ============================================================
CREATE TABLE public.products (
  id               uuid        NOT NULL DEFAULT uuid_generate_v4(),
  store_id         uuid        NOT NULL REFERENCES public.stores(id)     ON DELETE RESTRICT,
  category_id      uuid                 REFERENCES public.categories(id) ON DELETE SET NULL,
  drop_id          uuid                 REFERENCES public.drops(id)      ON DELETE SET NULL,
  name             text        NOT NULL,
  slug             text        NOT NULL,
  description      text,
  base_price       numeric     NOT NULL CHECK (base_price >= 0),
  compare_at_price numeric              CHECK (compare_at_price IS NULL OR compare_at_price >= base_price),
  main_image       text        NOT NULL,
  status           text        NOT NULL DEFAULT 'draft',
  is_customizable  boolean     NOT NULL DEFAULT false,
  total_views      integer     NOT NULL DEFAULT 0 CHECK (total_views >= 0),
  deleted_at       timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_pkey             PRIMARY KEY (id),
  CONSTRAINT products_store_slug_unique UNIQUE (store_id, slug),
  CONSTRAINT products_status_check     CHECK (status = ANY (ARRAY['draft','active','archived']))
);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_products_store_id    ON public.products (store_id);
CREATE INDEX idx_products_category_id ON public.products (category_id);
CREATE INDEX idx_products_drop_id     ON public.products (drop_id);
CREATE INDEX idx_products_status      ON public.products (store_id, status);
CREATE INDEX idx_products_active      ON public.products (store_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_created_at  ON public.products (store_id, created_at DESC);


-- ============================================================
-- TABLA: product_images
-- ============================================================
CREATE TABLE public.product_images (
  id            uuid    NOT NULL DEFAULT uuid_generate_v4(),
  product_id    uuid    NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url     text    NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  CONSTRAINT product_images_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_product_images_product_id ON public.product_images (product_id);


-- ============================================================
-- TABLA: product_options
-- ============================================================
CREATE TABLE public.product_options (
  id         uuid    NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid    NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name       text    NOT NULL,
  position   integer NOT NULL DEFAULT 0,
  CONSTRAINT product_options_pkey              PRIMARY KEY (id),
  CONSTRAINT product_options_product_name_uniq UNIQUE (product_id, name)
);

CREATE INDEX idx_product_options_product_id ON public.product_options (product_id);


-- ============================================================
-- TABLA: product_option_values
-- ============================================================
CREATE TABLE public.product_option_values (
  id        uuid    NOT NULL DEFAULT uuid_generate_v4(),
  option_id uuid    NOT NULL REFERENCES public.product_options(id) ON DELETE CASCADE,
  value     text    NOT NULL,
  position  integer NOT NULL DEFAULT 0,
  CONSTRAINT product_option_values_pkey          PRIMARY KEY (id),
  CONSTRAINT product_option_values_option_val_uniq UNIQUE (option_id, value)
);

CREATE INDEX idx_pov_option_id ON public.product_option_values (option_id);


-- ============================================================
-- TABLA: product_variants
-- ============================================================
CREATE TABLE public.product_variants (
  id                  uuid        NOT NULL DEFAULT uuid_generate_v4(),
  product_id          uuid        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku                 text,
  combination_key     text        NOT NULL,
  price               numeric     NOT NULL CHECK (price >= 0),
  stock_quantity      integer     NOT NULL DEFAULT 0  CHECK (stock_quantity >= 0),
  reserved_stock      integer     NOT NULL DEFAULT 0  CHECK (reserved_stock >= 0),
  low_stock_threshold integer     NOT NULL DEFAULT 5  CHECK (low_stock_threshold >= 0),
  track_inventory     boolean     NOT NULL DEFAULT true,
  weight              numeric,
  image_url           text,
  is_active           boolean     NOT NULL DEFAULT true,
  deleted_at          timestamptz,
  CONSTRAINT product_variants_pkey              PRIMARY KEY (id),
  CONSTRAINT product_variants_combination_uniq  UNIQUE (product_id, combination_key),
  CONSTRAINT product_variants_reserved_lte_stock CHECK (reserved_stock <= stock_quantity)
);

-- SKU único globalmente solo cuando no es NULL
CREATE UNIQUE INDEX product_variants_sku_unique
  ON public.product_variants (sku)
  WHERE sku IS NOT NULL;

CREATE INDEX idx_variants_product_id ON public.product_variants (product_id);
CREATE INDEX idx_variants_is_active  ON public.product_variants (product_id, is_active);
CREATE INDEX idx_variants_active     ON public.product_variants (product_id) WHERE deleted_at IS NULL;


-- ============================================================
-- TABLA: variant_option_values
-- ============================================================
CREATE TABLE public.variant_option_values (
  variant_id      uuid NOT NULL REFERENCES public.product_variants(id)      ON DELETE CASCADE,
  option_value_id uuid NOT NULL REFERENCES public.product_option_values(id) ON DELETE CASCADE,
  CONSTRAINT variant_option_values_pkey PRIMARY KEY (variant_id, option_value_id)
);

CREATE INDEX idx_vov_option_value_id ON public.variant_option_values (option_value_id);


-- ============================================================
-- TABLA: orders
-- ============================================================
CREATE TABLE public.orders (
  id               uuid        NOT NULL DEFAULT uuid_generate_v4(),
  store_id         uuid        NOT NULL REFERENCES public.stores(id)    ON DELETE RESTRICT,
  customer_id      uuid        NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  order_number     text        NOT NULL,
  status           text        NOT NULL DEFAULT 'pending',
  total_amount     numeric     NOT NULL CHECK (total_amount >= 0),
  shipping_address jsonb,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_pkey                  PRIMARY KEY (id),
  CONSTRAINT orders_store_number_unique   UNIQUE (store_id, order_number),
  CONSTRAINT orders_status_check          CHECK (status = ANY (ARRAY['pending','paid','processing','shipped','delivered','cancelled']))
);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_orders_store_id    ON public.orders (store_id);
CREATE INDEX idx_orders_customer_id ON public.orders (customer_id);
CREATE INDEX idx_orders_status      ON public.orders (store_id, status);
CREATE INDEX idx_orders_created_at  ON public.orders (store_id, created_at DESC);


-- ============================================================
-- TABLA: order_items
-- ============================================================
CREATE TABLE public.order_items (
  id              uuid    NOT NULL DEFAULT uuid_generate_v4(),
  order_id        uuid    NOT NULL REFERENCES public.orders(id)           ON DELETE CASCADE,
  variant_id      uuid    NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
  product_name    text    NOT NULL,
  variant_details text,
  quantity        integer NOT NULL CHECK (quantity > 0),
  unit_price      numeric NOT NULL CHECK (unit_price >= 0),
  total_price     numeric NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,
  CONSTRAINT order_items_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_order_items_order_id   ON public.order_items (order_id);
CREATE INDEX idx_order_items_variant_id ON public.order_items (variant_id);


-- ============================================================
-- TABLA: daily_metrics
-- ============================================================
CREATE TABLE public.daily_metrics (
  store_id      uuid    NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  date          date    NOT NULL DEFAULT CURRENT_DATE,
  total_views   integer NOT NULL DEFAULT 0 CHECK (total_views >= 0),
  total_sales   numeric NOT NULL DEFAULT 0 CHECK (total_sales >= 0),
  total_orders  integer NOT NULL DEFAULT 0 CHECK (total_orders >= 0),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT daily_metrics_pkey PRIMARY KEY (store_id, date)
);

CREATE TRIGGER trg_daily_metrics_updated_at
  BEFORE UPDATE ON public.daily_metrics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_daily_metrics_date ON public.daily_metrics (store_id, date DESC);


-- ============================================================
-- TABLA: product_views_daily
-- ============================================================
CREATE TABLE public.product_views_daily (
  store_id   uuid    NOT NULL REFERENCES public.stores(id)   ON DELETE CASCADE,
  product_id uuid    NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  date       date    NOT NULL DEFAULT CURRENT_DATE,
  views      integer NOT NULL DEFAULT 0 CHECK (views >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_views_daily_pkey PRIMARY KEY (store_id, product_id, date)
);

CREATE TRIGGER trg_product_views_daily_updated_at
  BEFORE UPDATE ON public.product_views_daily
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_pvd_product_date ON public.product_views_daily (product_id, date DESC);


-- ============================================================
-- TABLA: site_config
-- ============================================================
CREATE TABLE public.site_config (
  id          uuid        NOT NULL DEFAULT uuid_generate_v4(),
  store_id    uuid        NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  key         text        NOT NULL,
  value       jsonb       NOT NULL DEFAULT '{}',
  is_active   boolean     NOT NULL DEFAULT true,
  visibility  text        NOT NULL DEFAULT 'public',
  description text,
  updated_by  uuid                 REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_config_pkey            PRIMARY KEY (id),
  CONSTRAINT site_config_store_key_uniq  UNIQUE (store_id, key),
  CONSTRAINT site_config_visibility_check CHECK (visibility = ANY (ARRAY['public','private','internal']))
);

CREATE TRIGGER trg_site_config_updated_at
  BEFORE UPDATE ON public.site_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_site_config_store ON public.site_config (store_id, is_active);


-- ============================================================
-- ROW LEVEL SECURITY
-- Habilitado en todas las tablas.
-- Agregá tus propias policies según tu modelo de auth.
-- ============================================================
ALTER TABLE public.stores               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drops                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views_daily  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config          ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- EJEMPLO DE POLICIES (descomenta y adaptá)
-- ============================================================

-- Store admins leen sus propios datos
-- CREATE POLICY "store_admin_read"
--   ON public.products FOR SELECT
--   USING (
--     store_id IN (
--       SELECT store_id FROM public.user_roles
--       WHERE user_id = auth.uid()
--         AND role IN ('super_admin', 'store_admin')
--     )
--   );

-- Customers leen solo sus propias órdenes
-- CREATE POLICY "customer_read_own_orders"
--   ON public.orders FOR SELECT
--   USING (
--     customer_id IN (
--       SELECT id FROM public.customers
--       WHERE auth_user_id = auth.uid()
--     )
--   );


-- ============================================================
-- SCRIPT PARA BORRAR TODO (correr ANTES si ya existe el schema)
-- ============================================================
-- DROP TABLE IF EXISTS
--   public.site_config,
--   public.product_views_daily,
--   public.daily_metrics,
--   public.order_items,
--   public.orders,
--   public.variant_option_values,
--   public.product_variants,
--   public.product_option_values,
--   public.product_options,
--   public.product_images,
--   public.products,
--   public.customers,
--   public.drops,
--   public.categories,
--   public.user_roles,
--   public.stores
-- CASCADE;
-- DROP FUNCTION IF EXISTS public.set_updated_at CASCADE;
