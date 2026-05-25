-- ============================================================
-- RLS POLICIES — PRODUCCIÓN
-- Ejecutar DESPUÉS de schema_production.sql
-- ============================================================


-- ============================================================
-- 0. LIMPIEZA IDEMPOTENTE DE POLICIES EXISTENTES
-- ============================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      r.policyname,
      r.tablename
    );
  END LOOP;
END $$;


-- ============================================================
-- 1. FUNCIÓN HELPER: is_store_admin
--
-- Retorna true si el usuario autenticado tiene rol
-- 'super_admin' o 'store_admin' en la tienda dada.
--
-- SECURITY DEFINER: corre como el owner de la función,
-- evitando recursión infinita de RLS en user_roles.
-- search_path fijado a public por seguridad.
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_store_admin(p_store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id  = auth.uid()
      AND store_id = p_store_id
      AND role IN ('super_admin', 'store_admin')
  );
$$;


-- ============================================================
-- 2. ENABLE RLS
-- (Sin FORCE: evitamos bloquear el rol postgres del dashboard)
-- ============================================================
ALTER TABLE public.stores                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drops                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views_daily   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config           ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 3. STORES
-- ============================================================

-- Público: solo tiendas activas
CREATE POLICY "public_read_active_stores"
ON public.stores FOR SELECT
USING (is_active = true);

-- Admin: gestión completa de su propia tienda
CREATE POLICY "admin_manage_stores"
ON public.stores FOR ALL
USING     (public.is_store_admin(id))
WITH CHECK (public.is_store_admin(id));


-- ============================================================
-- 4. USER_ROLES
-- ============================================================

-- Admin: gestión completa de roles en su tienda
CREATE POLICY "admin_manage_user_roles"
ON public.user_roles FOR ALL
USING     (public.is_store_admin(store_id))
WITH CHECK (public.is_store_admin(store_id));

-- Cada usuario ve su propio rol (para saber qué permisos tiene)
CREATE POLICY "self_read_own_role"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());


-- ============================================================
-- 5. CATEGORIES
-- ============================================================

-- Público: todas las categorías de tiendas activas
CREATE POLICY "public_read_categories"
ON public.categories FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = categories.store_id
      AND s.is_active = true
  )
);

-- Admin: gestión completa en su tienda
CREATE POLICY "admin_manage_categories"
ON public.categories FOR ALL
USING     (public.is_store_admin(store_id))
WITH CHECK (public.is_store_admin(store_id));


-- ============================================================
-- 6. DROPS
-- ============================================================

-- Público: drops visibles (scheduled o live)
CREATE POLICY "public_read_drops"
ON public.drops FOR SELECT
USING (
  status IN ('scheduled', 'live')
  AND EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = drops.store_id
      AND s.is_active = true
  )
);

-- Admin: gestión completa incluyendo drops 'ended'
CREATE POLICY "admin_manage_drops"
ON public.drops FOR ALL
USING     (public.is_store_admin(store_id))
WITH CHECK (public.is_store_admin(store_id));


-- ============================================================
-- 7. PRODUCTS
-- ============================================================

-- Público: productos activos y no borrados
CREATE POLICY "public_read_products"
ON public.products FOR SELECT
USING (
  status = 'active'
  AND deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = products.store_id
      AND s.is_active = true
  )
);

-- Admin: gestión completa (incluye draft, archived, soft-deleted)
CREATE POLICY "admin_manage_products"
ON public.products FOR ALL
USING     (public.is_store_admin(store_id))
WITH CHECK (public.is_store_admin(store_id));


-- ============================================================
-- 8. PRODUCT_IMAGES
-- ============================================================

-- Público: imágenes de productos activos
CREATE POLICY "public_read_product_images"
ON public.product_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_images.product_id
      AND p.status = 'active'
      AND p.deleted_at IS NULL
  )
);

-- Admin: gestión completa vía store_id del producto padre
CREATE POLICY "admin_manage_product_images"
ON public.product_images FOR ALL
USING (
  public.is_store_admin(
    (SELECT store_id FROM public.products WHERE id = product_images.product_id)
  )
);


-- ============================================================
-- 9. PRODUCT_OPTIONS
-- ============================================================

-- Público: opciones de productos activos únicamente
CREATE POLICY "public_read_product_options"
ON public.product_options FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_options.product_id
      AND p.status = 'active'
      AND p.deleted_at IS NULL
  )
);

-- Admin
CREATE POLICY "admin_manage_product_options"
ON public.product_options FOR ALL
USING (
  public.is_store_admin(
    (SELECT store_id FROM public.products WHERE id = product_options.product_id)
  )
);


-- ============================================================
-- 10. PRODUCT_OPTION_VALUES
-- ============================================================

-- Público: valores de opciones de productos activos
CREATE POLICY "public_read_product_option_values"
ON public.product_option_values FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.product_options o
    JOIN public.products p ON p.id = o.product_id
    WHERE o.id = product_option_values.option_id
      AND p.status = 'active'
      AND p.deleted_at IS NULL
  )
);

-- Admin
CREATE POLICY "admin_manage_product_option_values"
ON public.product_option_values FOR ALL
USING (
  public.is_store_admin(
    (
      SELECT p.store_id
      FROM public.products p
      JOIN public.product_options o ON p.id = o.product_id
      WHERE o.id = product_option_values.option_id
    )
  )
);


-- ============================================================
-- 11. PRODUCT_VARIANTS
-- ============================================================

-- Público: variantes activas de productos activos
CREATE POLICY "public_read_variants"
ON public.product_variants FOR SELECT
USING (
  is_active = true
  AND deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_variants.product_id
      AND p.status = 'active'
      AND p.deleted_at IS NULL
  )
);

-- Admin
CREATE POLICY "admin_manage_variants"
ON public.product_variants FOR ALL
USING (
  public.is_store_admin(
    (SELECT store_id FROM public.products WHERE id = product_variants.product_id)
  )
);


-- ============================================================
-- 12. VARIANT_OPTION_VALUES
-- ============================================================

-- Público: combinaciones de variantes activas
CREATE POLICY "public_read_variant_option_values"
ON public.variant_option_values FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.product_variants v
    JOIN public.products p ON p.id = v.product_id
    WHERE v.id = variant_option_values.variant_id
      AND v.is_active = true
      AND v.deleted_at IS NULL
      AND p.status = 'active'
      AND p.deleted_at IS NULL
  )
);

-- Admin
CREATE POLICY "admin_manage_variant_option_values"
ON public.variant_option_values FOR ALL
USING (
  public.is_store_admin(
    (
      SELECT p.store_id
      FROM public.products p
      JOIN public.product_variants v ON p.id = v.product_id
      WHERE v.id = variant_option_values.variant_id
    )
  )
);


-- ============================================================
-- 13. CUSTOMERS
-- ============================================================

-- Cada customer ve y edita su propio perfil
CREATE POLICY "customer_read_own_profile"
ON public.customers FOR SELECT
USING (auth_user_id = auth.uid());

CREATE POLICY "customer_update_own_profile"
ON public.customers FOR UPDATE
USING     (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- Admin: gestión completa
CREATE POLICY "admin_manage_customers"
ON public.customers FOR ALL
USING     (public.is_store_admin(store_id))
WITH CHECK (public.is_store_admin(store_id));


-- ============================================================
-- 14. ORDERS
-- ============================================================

-- Customer: ve sus propias órdenes
CREATE POLICY "customer_read_own_orders"
ON public.orders FOR SELECT
USING (
  customer_id IN (
    SELECT id FROM public.customers
    WHERE auth_user_id = auth.uid()
  )
);

-- Admin: gestión completa
CREATE POLICY "admin_manage_orders"
ON public.orders FOR ALL
USING     (public.is_store_admin(store_id))
WITH CHECK (public.is_store_admin(store_id));


-- ============================================================
-- 15. ORDER_ITEMS
-- ============================================================

-- Customer: ve ítems de sus propias órdenes
CREATE POLICY "customer_read_own_order_items"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.customers c ON c.id = o.customer_id
    WHERE o.id = order_items.order_id
      AND c.auth_user_id = auth.uid()
  )
);

-- Admin
CREATE POLICY "admin_manage_order_items"
ON public.order_items FOR ALL
USING (
  public.is_store_admin(
    (SELECT store_id FROM public.orders WHERE id = order_items.order_id)
  )
);


-- ============================================================
-- 16. ANALYTICS
-- ============================================================

-- product_views_daily: admin only
CREATE POLICY "admin_manage_product_views"
ON public.product_views_daily FOR ALL
USING     (public.is_store_admin(store_id))
WITH CHECK (public.is_store_admin(store_id));

-- daily_metrics: admin only
CREATE POLICY "admin_manage_daily_metrics"
ON public.daily_metrics FOR ALL
USING     (public.is_store_admin(store_id))
WITH CHECK (public.is_store_admin(store_id));


-- ============================================================
-- 17. SITE_CONFIG
-- ============================================================

-- Público: solo claves activas y visibilidad 'public'
CREATE POLICY "public_read_site_config"
ON public.site_config FOR SELECT
USING (
  is_active = true
  AND visibility = 'public'
  AND EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = site_config.store_id
      AND s.is_active = true
  )
);

-- Admin: gestión completa incluyendo claves private/internal
CREATE POLICY "admin_manage_site_config"
ON public.site_config FOR ALL
USING     (public.is_store_admin(store_id))
WITH CHECK (public.is_store_admin(store_id));
