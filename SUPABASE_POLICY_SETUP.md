```sql
-- 🔐 SUPABASE_POLICY_SETUP_V5 — RLS PRODUCCIÓN 10/10
-- Ejecutar DESPUÉS del archivo SUPABASE_SETUP

-- =====================================================
-- 0 LIMPIEZA IDEMPOTENTE DE POLICIES
-- =====================================================

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

-- =====================================================
-- 1 ENABLE + FORCE RLS
-- =====================================================

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.stores FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;
ALTER TABLE public.drops FORCE ROW LEVEL SECURITY;
ALTER TABLE public.products FORCE ROW LEVEL SECURITY;
ALTER TABLE public.product_images FORCE ROW LEVEL SECURITY;
ALTER TABLE public.product_options FORCE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_values FORCE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants FORCE ROW LEVEL SECURITY;
ALTER TABLE public.variant_option_values FORCE ROW LEVEL SECURITY;
ALTER TABLE public.customers FORCE ROW LEVEL SECURITY;
ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;
ALTER TABLE public.order_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.product_views_daily FORCE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics FORCE ROW LEVEL SECURITY;
ALTER TABLE public.site_config FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 2 PUBLIC STORE DATA (FRONTEND)
-- =====================================================

CREATE POLICY "public_view_active_stores"
ON public.stores
FOR SELECT
USING (is_active = true);

CREATE POLICY "public_view_categories"
ON public.categories
FOR SELECT
USING (true);

CREATE POLICY "public_view_drops"
ON public.drops
FOR SELECT
USING (status IN ('scheduled','live'));

CREATE POLICY "public_view_products"
ON public.products
FOR SELECT
USING (
status = 'active'
AND deleted_at IS NULL
);

CREATE POLICY "public_view_product_images"
ON public.product_images
FOR SELECT
USING (
EXISTS (
SELECT 1
FROM public.products p
WHERE p.id = product_images.product_id
AND p.status = 'active'
AND p.deleted_at IS NULL
)
);

CREATE POLICY "public_view_product_options"
ON public.product_options
FOR SELECT
USING (true);

CREATE POLICY "public_view_product_option_values"
ON public.product_option_values
FOR SELECT
USING (true);

CREATE POLICY "public_view_variants"
ON public.product_variants
FOR SELECT
USING (
is_active = true
AND deleted_at IS NULL
AND EXISTS (
SELECT 1
FROM public.products p
WHERE p.id = product_variants.product_id
AND p.status = 'active'
AND p.deleted_at IS NULL
)
);

CREATE POLICY "public_view_variant_option_values"
ON public.variant_option_values
FOR SELECT
USING (true);

CREATE POLICY "public_view_site_config"
ON public.site_config
FOR SELECT
USING (
is_active = true
AND visibility = 'public'
);

-- =====================================================
-- 3 ADMIN STORE MANAGEMENT
-- =====================================================

CREATE POLICY "admin_manage_stores"
ON public.stores
FOR ALL
USING (public.is_store_admin(id))
WITH CHECK (public.is_store_admin(id));

CREATE POLICY "admin_manage_user_roles"
ON public.user_roles
FOR ALL
USING (public.is_store_admin(store_id))
WITH CHECK (public.is_store_admin(store_id));

CREATE POLICY "admin_manage_categories"
ON public.categories
FOR ALL
USING (public.is_store_admin(store_id))
WITH CHECK (public.is_store_admin(store_id));

CREATE POLICY "admin_manage_drops"
ON public.drops
FOR ALL
USING (public.is_store_admin(store_id))
WITH CHECK (public.is_store_admin(store_id));

CREATE POLICY "admin_manage_products"
ON public.products
FOR ALL
USING (public.is_store_admin(store_id))
WITH CHECK (public.is_store_admin(store_id));

CREATE POLICY "admin_manage_site_config"
ON public.site_config
FOR ALL
USING (public.is_store_admin(store_id))
WITH CHECK (public.is_store_admin(store_id));

CREATE POLICY "admin_manage_customers"
ON public.customers
FOR ALL
USING (public.is_store_admin(store_id))
WITH CHECK (public.is_store_admin(store_id));

CREATE POLICY "admin_manage_orders"
ON public.orders
FOR ALL
USING (public.is_store_admin(store_id))
WITH CHECK (public.is_store_admin(store_id));

-- =====================================================
-- 4 ADMIN ACCESS CHILD TABLES
-- =====================================================

CREATE POLICY "admin_manage_product_images"
ON public.product_images
FOR ALL
USING (
public.is_store_admin(
(SELECT store_id FROM public.products WHERE id = product_images.product_id)
)
);

CREATE POLICY "admin_manage_product_options"
ON public.product_options
FOR ALL
USING (
public.is_store_admin(
(SELECT store_id FROM public.products WHERE id = product_options.product_id)
)
);

CREATE POLICY "admin_manage_product_option_values"
ON public.product_option_values
FOR ALL
USING (
public.is_store_admin(
(
SELECT p.store_id
FROM public.products p
JOIN public.product_options o
ON p.id = o.product_id
WHERE o.id = product_option_values.option_id
)
)
);

CREATE POLICY "admin_manage_variants"
ON public.product_variants
FOR ALL
USING (
public.is_store_admin(
(SELECT store_id FROM public.products WHERE id = product_variants.product_id)
)
);

CREATE POLICY "admin_manage_variant_option_values"
ON public.variant_option_values
FOR ALL
USING (
public.is_store_admin(
(
SELECT p.store_id
FROM public.products p
JOIN public.product_variants v
ON p.id = v.product_id
WHERE v.id = variant_option_values.variant_id
)
)
);

CREATE POLICY "admin_manage_order_items"
ON public.order_items
FOR ALL
USING (
public.is_store_admin(
(SELECT store_id FROM public.orders WHERE id = order_items.order_id)
)
);

-- =====================================================
-- 5 ANALYTICS (ADMIN ONLY)
-- =====================================================

CREATE POLICY "admin_manage_product_views"
ON public.product_views_daily
FOR ALL
USING (public.is_store_admin(store_id))
WITH CHECK (public.is_store_admin(store_id));

CREATE POLICY "admin_manage_daily_metrics"
ON public.daily_metrics
FOR ALL
USING (public.is_store_admin(store_id))
WITH CHECK (public.is_store_admin(store_id));

```

