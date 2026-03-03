```sql

-- 🔐 SUPABASE_POLICY_SETUP — RLS MULTI-TENANT PARA PRODUCCIÓN
-- Ejecutar este archivo SEGUNDO.

-- ==============================================================================
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- ==============================================================================
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

-- ==============================================================================
-- 2. POLÍTICAS PÚBLICAS (LECTURA DE VITRINA)
-- ==============================================================================
CREATE POLICY "Public view active stores" ON public.stores FOR SELECT USING (is_active = true);
CREATE POLICY "Public view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public view drops" ON public.drops FOR SELECT USING (status IN ('scheduled', 'live'));

-- Productos y Variantes respetan el deleted_at y el is_active
CREATE POLICY "Public view active products" ON public.products FOR SELECT 
USING (status = 'active' AND deleted_at IS NULL);

CREATE POLICY "Public view product images" ON public.product_images FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.products WHERE id = product_images.product_id AND status = 'active' AND deleted_at IS NULL));

CREATE POLICY "Public view options" ON public.product_options FOR SELECT USING (true);
CREATE POLICY "Public view option values" ON public.product_option_values FOR SELECT USING (true);
CREATE POLICY "Public view variant option values" ON public.variant_option_values FOR SELECT USING (true);

CREATE POLICY "Public view active variants" ON public.product_variants FOR SELECT 
USING (is_active = true AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.products WHERE id = product_variants.product_id AND status = 'active' AND deleted_at IS NULL));

CREATE POLICY "Public view active site config" ON public.site_config FOR SELECT 
USING (is_active = true AND visibility = 'public');

-- ==============================================================================
-- 3. POLÍTICAS DE ADMINISTRACIÓN (MULTI-TENANT AISLADO)
-- ==============================================================================
-- Tablas principales con store_id directo
CREATE POLICY "Admin manage own store" ON public.stores FOR ALL USING (public.is_store_admin(id)) WITH CHECK (public.is_store_admin(id));
CREATE POLICY "Admin manage own store roles" ON public.user_roles FOR ALL USING (public.is_store_admin(store_id));
CREATE POLICY "Admin manage own store categories" ON public.categories FOR ALL USING (public.is_store_admin(store_id));
CREATE POLICY "Admin manage own store drops" ON public.drops FOR ALL USING (public.is_store_admin(store_id));
CREATE POLICY "Admin manage own store products" ON public.products FOR ALL USING (public.is_store_admin(store_id));
CREATE POLICY "Admin manage own analytics views" ON public.product_views_daily FOR ALL USING (public.is_store_admin(store_id));
CREATE POLICY "Admin manage own analytics metrics" ON public.daily_metrics FOR ALL USING (public.is_store_admin(store_id));
CREATE POLICY "Admin manage own store site config" ON public.site_config FOR ALL USING (public.is_store_admin(store_id));

-- Tablas hijas (Validación mediante sub-queries al store_id del padre)
CREATE POLICY "Admin manage own product images" ON public.product_images FOR ALL 
USING (public.is_store_admin((SELECT store_id FROM public.products WHERE id = product_images.product_id)));

CREATE POLICY "Admin manage own product options" ON public.product_options FOR ALL 
USING (public.is_store_admin((SELECT store_id FROM public.products WHERE id = product_options.product_id)));

CREATE POLICY "Admin manage own product option values" ON public.product_option_values FOR ALL 
USING (public.is_store_admin((SELECT p.store_id FROM public.products p JOIN public.product_options o ON p.id = o.product_id WHERE o.id = product_option_values.option_id)));

CREATE POLICY "Admin manage own product variants" ON public.product_variants FOR ALL 
USING (public.is_store_admin((SELECT store_id FROM public.products WHERE id = product_variants.product_id)));

CREATE POLICY "Admin manage own variant option values" ON public.variant_option_values FOR ALL 
USING (public.is_store_admin((SELECT p.store_id FROM public.products p JOIN public.product_variants v ON p.id = v.product_id WHERE v.id = variant_option_values.variant_id)));

-- ==============================================================================
-- 4. POLÍTICAS DE CLIENTES Y ÓRDENES (B2C PRIVACY)
-- ==============================================================================
-- Customers
CREATE POLICY "Admin manage own store customers" ON public.customers FOR ALL USING (public.is_store_admin(store_id));
CREATE POLICY "Users view own customer profile" ON public.customers FOR SELECT USING (auth_user_id = auth.uid());
CREATE POLICY "Users update own customer profile" ON public.customers FOR UPDATE USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());

-- Orders
CREATE POLICY "Admin manage own store orders" ON public.orders FOR ALL USING (public.is_store_admin(store_id));
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid()));
CREATE POLICY "Allow authenticated order creation" ON public.orders FOR INSERT WITH CHECK (customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid()));

-- Order Items
CREATE POLICY "Admin manage own store order items" ON public.order_items FOR ALL USING (public.is_store_admin((SELECT store_id FROM public.orders WHERE id = order_items.order_id)));
CREATE POLICY "Users access own order items" ON public.order_items FOR ALL USING (EXISTS (SELECT 1 FROM public.orders o JOIN public.customers c ON o.customer_id = c.id WHERE o.id = order_items.order_id AND c.auth_user_id = auth.uid()));

```

